import {SingleTouchListener, MouseDownTracker, isTouchSupported, KeyboardHandler} from './io.js'
import {SimpleGridLayoutManager, GuiTextBox, GuiButton, GuiSpacer, getHeight, getWidth, RGB, ImageContainer, Sprite, GuiElement} from './gui.js'
import {random, srand, max_32_bit_signed, get_angle} from './utils.js'

interface Attackable {
    dim():number[];
    attack(enemy:Attackable):void;
    offense():number;
    defense():number; //0 - 1 //1 is 100% // 0 is 0%
    lose_hp(hp:number, enemy:Attackable):void;
    get_faction():Faction;
};
interface SpatialObject {

    get_normalized_vector(other:SpatialObject):number[];
    dim():number[];
    mid_x():number;
    mid_y():number;
};
class SquareAABBCollidable {
    x:number;
    y:number;
    width:number;
    height:number;
    constructor(x:number, y:number, width:number, height:number)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    check_collision(other:SquareAABBCollidable):boolean
    {
        return this.x < other.x + other.width && other.x < this.x + this.width && 
            this.y < other.y + other.height && other.y < this.y + this.height;
    }
    check_collision_gui(other:GuiElement, x:number, y:number):boolean
    {
        return this.x < x + other.width() && x < this.x + this.width && 
            this.y < y + other.height() && y < this.y + this.height;
    }
    get_normalized_vector(other:SpatialObject):number[]
    {
        const dy:number = -this.mid_y() + other.mid_y();
        const dx:number = -this.mid_x() + other.mid_x();
        const dist = Math.sqrt(dy*dy + dx*dx);
        const norm_dy = dy / dist;
        const norm_dx = dx / dist;
        return [dx / dist, dy / dist];
    }
    dim():number[]
    {
        return [this.x, this.y, this.width, this.height];
    }
    mid_x():number
    {
        return this.x + this.width / 2;
    }
    mid_y():number
    {
        return this.y + this.height / 2;
    }
}
function distance(a:SquareAABBCollidable, b:SquareAABBCollidable):number
{
    const dx = a.mid_x() - b.mid_x();
    const dy = a.mid_y() - b.mid_y();
    return Math.sqrt(dx*dx + dy*dy);
}
function manhattan_distance(a:SquareAABBCollidable, b:SquareAABBCollidable):number
{
    const dx = Math.abs(a.mid_x() - b.mid_x());
    const dy = Math.abs(a.mid_y() - b.mid_y());
    return dx + dy;
}
class Faction {
    //faction stats that are static
    name:string;
    money:number;
    color:RGB;
    fort_avatar:ImageContainer;
    unit_avatar:ImageContainer;
    flipped_unit_avatar:ImageContainer;
    battleField:BattleField;
    //faction stats governing gameplay (upgradable)
    attack:number;
    unit_reproduction_per_second:number;
    fort_reproduction_unit_limit:number;
    money_production_per_second:number;
    fort_defense:number;
    unit_defense:number;
    starting_unit_hp:number;
    unit_travel_speed:number;

    barrier_start_hp:number;
    barrier_attack:number;
    //for move calculation
    avg_move_value:number;
    sum_move_points:number;
    count_moves:number;

    
    constructor(name:string, color:RGB, fort_reproduction_unit_limit:number, load_image:boolean = false)
    {
        this.name = name;
        this.attack = 4 * (1 + random() / 5);
        this.avg_move_value = 0;
        this.sum_move_points = 400 * (0.5 + random());
        this.count_moves = 1;
        this.starting_unit_hp = 10;
        this.fort_defense = 0.15 * (0.75 + random());
        this.unit_defense = 0.05 * (0.75 + random());
        this.color = color;
        this.unit_reproduction_per_second = Math.floor(2.5 * (0.95 + random() / 10));
        this.money_production_per_second = 10;
        this.fort_reproduction_unit_limit = fort_reproduction_unit_limit;
        this.unit_travel_speed = Math.max(getWidth(), getHeight()) / 7.5;
        this.barrier_start_hp = 1000;
        this.barrier_attack = 0.45;
        if(load_image)
        {
            this.fort_avatar = new ImageContainer(this.name, `./images/${this.name}.png`);
            this.unit_avatar = new ImageContainer(this.name + "_unit", `./images/${this.name}unit.png`);
            this.flipped_unit_avatar = new ImageContainer(this.name + "_unit", `./images/${this.name}unitFlipped.png`);
        }
        else
        {
            this.fort_avatar = new ImageContainer(this.name, `./images/${"factionNeutral"}.png`);
            this.unit_avatar = new ImageContainer(this.name + "_unit", null);
        }
    }
    time_elapsed():number
    {
        return this.battleField.time_elapsed();
    }
    auto_upgrade():void
    {
        const upgrade_index = Math.floor(random() * this.battleField.game.upgrade_menu.upgrade_panels.length);
        const upgrade_panel = this.battleField.game.upgrade_menu.upgrade_panels[upgrade_index];
        this.battleField.game.upgrade_menu.faction = this;
        upgrade_panel.increment_attribute();
        this.battleField.game.upgrade_menu.faction = this.battleField.player_faction();
        upgrade_panel.refresh();
    }
};
class Unit extends SquareAABBCollidable implements Attackable {
    faction:Faction;
    currentFort:Fort|null;
    targetFort:Fort;
    hp:number;
    render:boolean;
    constructor(faction:Faction, fort:Fort, x:number, y:number)
    {
        const divisor = 4;
        super(x, y, Math.ceil(faction.battleField.fort_dim / divisor), Math.ceil(faction.battleField.fort_dim / divisor));
        this.faction = faction;
        this.hp = faction.starting_unit_hp;
        this.currentFort = fort;
        this.targetFort = fort;
        this.render = true;
    }
    draw(canvas:HTMLCanvasElement, ctx:CanvasRenderingContext2D):void
    {
        if(this.render && this.faction.unit_avatar.image)
        {
            if(this.targetFort.x - this.x > 0)
            {
                ctx.drawImage(this.faction.unit_avatar.image, this.mid_x(), this.mid_y(), this.width, this.height);
            }
            else if(this.faction.flipped_unit_avatar.image)
            {
                ctx.drawImage(this.faction.flipped_unit_avatar.image, this.mid_x(), this.mid_y(), this.width, this.height);
            }
        }
    }
    update_state(delta_time:number):boolean
    {
        if(distance(this, this.targetFort) < Math.floor(this.targetFort.width / 2))
        {
            if(this.targetFort.faction === this.faction)
            {
                this.targetFort.units.push(this);
                this.render = true;
                this.currentFort = this.targetFort;
                return false;
            }
            else
            {
                this.attack(this.targetFort);
                this.targetFort.attack(this);
                return this.hp > 0;
            }
        }
        else
        {
            const delta = this.faction.unit_travel_speed * delta_time * 1/1000;
            const dy:number = -this.mid_y() + this.targetFort.mid_y();
            const dx:number = -this.mid_x() + this.targetFort.mid_x();
            const dist = Math.sqrt(dy*dy + dx*dx);
            const norm_dy = dy / dist;
            const norm_dx = dx / dist;
            let ndy = delta * norm_dy;
            let ndx = delta * norm_dx;
            if (ndy * ndy > dy * dy || ndx * ndx > dx * dx) {
                ndx = dx;
                ndy = dy;
            }
            this.y += ndy;
            this.x += ndx;
            return true;
        }
    }
    get_faction():Faction
    {
        return this.faction;
    }

    lose_hp(hp:number, enemy:Attackable):void
    {
        const rand:number = Math.random();
        if(rand < 0.2)
        {
            let rand:number = Math.random();
            rand /= 10;
            if(hp > 0)
                this.hp -= hp * (1+rand);
            else
                this.hp -= 0.01 * (1+rand);
        }
        else if(rand < 0.6)
        {
            if(hp > 0)
                this.hp -= hp
        }
        else if(rand < 0.7)
        {
            let rand:number = Math.random();
            rand /= 3;
            if(hp > 0)
                this.hp -= hp * (1+rand);
            else
                this.hp -= 0.01 * (1+rand);
        }
        else if(rand < 0.9)
        {
            let rand:number = Math.random();
            rand /= 2;
            if(hp > 0)
                this.hp -= hp * (1+rand);
            else
                this.hp -= 0.01 * (1+rand);
        }
        else
        {
            let rand:number = Math.random();
            if(hp > 0)
                this.hp -= hp * (1+rand);
            else
                this.hp -= 0.01 * (1+rand);
        }
    }
    attack(enemy:Attackable): void
    {
        enemy.lose_hp(this.offense() * (1 - enemy.defense()), this);
    }
    offense():number
    {
        return this.faction.attack;
    }
    defense(): number 
    {
        return this.faction.unit_defense;
    }
};
class Fort extends SquareAABBCollidable implements Attackable {
    faction:Faction;
    units:Unit[];
    leaving_units:Unit[];
    last_update_unit_reproduction:number;
    last_update_units_leaving:number;
    font_size:number;
    font_name:string;

    constructor(faction:Faction, x:number, y:number, width:number, height:number)
    {
        super(x, y, width, height);
        this.faction = faction;
        this.last_update_unit_reproduction = Date.now();
        this.last_update_units_leaving = Date.now();
        this.units = [];
        this.leaving_units = [];
        this.font_size = Math.ceil(this.faction.battleField.fort_dim * 3/8);
        this.font_name = "Helvetica";
    }
    update_state(delta_time:number):void
    {
        //reproduce new units
        if(this.units.length + this.leaving_units.length < this.faction.fort_reproduction_unit_limit && Date.now() - this.last_update_unit_reproduction > (1000 / this.faction.unit_reproduction_per_second))
        {
            const head = this.units.pop();
            this.units.push(new Unit(this.faction, this, this.mid_x(), this.mid_y()));
            if(head)
                this.units.push(head);
            
            this.last_update_unit_reproduction = Date.now();
        }
        //send out leaving units
        if(Date.now() - this.last_update_units_leaving > 100 && this.faction.battleField.traveling_units.length < 5000)
        {
            const limit:number = Math.min(3, this.leaving_units.length);
            for(let i = 0; i < limit; i++)
            {
                const unit = this.leaving_units.pop()!;
                const unit_vector = unit.get_normalized_vector(unit.targetFort);
                unit.x += i * unit.width * (unit_vector[0] < 0 ? 1:-1);
                unit.y += i * unit.height * (unit_vector[1] < 0 ? 1:-1);
                this.faction.battleField.traveling_units.push(unit);
            }
            this.last_update_units_leaving = Date.now();
        }
    }
    unsend_units():void
    {
        while(this.leaving_units.length)
        {
            this.units.push(this.leaving_units.pop()!);
        }
    }
    send_units(destination:Fort):void
    {
        for(let i = 0; i < this.leaving_units.length; i++)
        {
            this.leaving_units[i].targetFort = destination;
        }
        this.auto_send_units(destination)
    }
    auto_send_units(destination:Fort):void
    {
        for(let i = this.units.length - 1; i >= 0; i--)
        {
            const unit = this.units[i];
            unit.targetFort = destination;
            this.leaving_units.push(unit);
            this.units.pop();
        }
    }
    draw(canvas:HTMLCanvasElement, ctx:CanvasRenderingContext2D):void
    {
        ctx.font = `${this.font_size}px ${this.font_name}`;
        ctx.strokeStyle = "#FFFFFF";
        ctx.fillStyle = "#000000";
        ctx.lineWidth = 4;
        
        if(this.faction !== this.faction.battleField.factions[0])
        {
            if(this.faction.fort_avatar.image)
            {
                ctx.drawImage(this.faction.fort_avatar.image, this.x, this.y, this.width, this.height);
            }
            else
            {
                ctx.fillStyle = this.faction.color.htmlRBG();
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
            if(this.faction == this.faction.battleField.player_faction())
            {
                ctx.font = `${this.font_size - 5}px ${this.font_name}`;
                ctx.strokeText("player", this.mid_x() - this.width / 4, this.mid_y() + this.font_size, this.width / 2);  
                ctx.fillText("player", this.mid_x() - this.width / 4, this.mid_y() + this.font_size, this.width / 2);  
            } 
            if(this.faction.battleField.game.dev_mode)
            {
                ctx.fillText(this.faction.battleField.forts.indexOf(this) + ":", this.x, this.y, this.width / 2);
                ctx.fillText(this.faction.battleField.factions.indexOf(this.faction) + "", this.x + this.width / 2, this.y, this.width / 2);
            }
        }
        else
        {
            if(this.faction.fort_avatar.image)
            {
                ctx.drawImage(this.faction.fort_avatar.image, this.x, this.y, this.width, this.height);
            }
        } 
        ctx.strokeText((this.units.length + this.leaving_units.length) + "", this.mid_x() - this.width / 4, this.mid_y(), this.width / 2); 
        ctx.fillText((this.units.length + this.leaving_units.length) + "", this.mid_x() - this.width / 4, this.mid_y(), this.width / 2);  
        
        ctx.lineWidth = 1; 
    }
    get_faction():Faction
    {
        return this.faction;
    }
    lose_hp(hp: number, enemy:Attackable): void {
        const unit = this.leaving_units[this.leaving_units.length - 1];
        if(unit)
        {
            this.lose_hp_internal(hp, enemy, unit);
        }
        else
        {
            const unit = this.units[this.units.length - 1];
            if(unit)
                this.lose_hp_internal(hp, enemy, unit);
        }
    }
    lose_hp_internal(hp: number, enemy:Attackable, unit:Unit):void
    {
        if(unit)
        {
            unit.lose_hp(hp, enemy);
            if(unit.hp < 0)
            {
                this.units.pop();
                if(this.units.length === 0 && this.leaving_units.length === 0)
                {
                    this.faction = enemy.get_faction();
                }
            }
        }
    }
    attack(enemy:Attackable): void
    {
        enemy.lose_hp(this.offense() * (1 - enemy.defense()), this);
    }
    offense():number
    {
        return this.faction.attack;
    }
    defense(): number 
    {
        return this.faction.fort_defense;
    }
};
class FortAggregate {
    fort:Fort;
    defense_power:number;
    defense_leaving_forces:number;
    attacking_force:number;
    defense_force_inbound:number;
    en_route_from_player:number;

    constructor(fort:Fort, defense_power:number, defense_leaving_forces:number)
    {
        this.fort = fort;
        this.defense_power = defense_power;
        this.defense_leaving_forces = defense_leaving_forces;
        this.attacking_force = 0;
        this.en_route_from_player = 0;
    }
    immediate_defense_power():number
    {
        return this.defense_leaving_forces + this.defense_power;
    }
};
class FactionAggregate {
    faction:Faction;
    total_units:number;
    units_attacking:number;
};
function calc_points_move(attacker:FortAggregate, defender:FortAggregate, delta_time:number, hp_by_faction:Map<Faction, number>, board_power:number):number
{
    let points = 0;
    const time_to_travel:number = (distance(attacker.fort, defender.fort) / attacker.fort.faction.unit_travel_speed);
    const def_repro_per_frame = defender.fort.faction.unit_reproduction_per_second / (60);

    const enemy_after_time_to_travel_hp:number = (time_to_travel * def_repro_per_frame < defender.fort.faction.fort_reproduction_unit_limit ?
        time_to_travel * def_repro_per_frame : 
        defender.fort.faction.fort_reproduction_unit_limit) + defender.defense_power;

    if(attacker.fort.faction === defender.fort.faction)
    {
        points += (attacker.defense_power);
    }
    points -= (enemy_after_time_to_travel_hp + defender.defense_leaving_forces / 2) - attacker.attacking_force;
    points -= defender.attacking_force / 15;
    return points;
}
function calc_points_move_mid_game(attacker:FortAggregate, defender:FortAggregate, delta_time:number, hp_by_faction:Map<Faction, number>, board_power:number):number
{
    let points = 0;
    const time_to_travel:number = (distance(attacker.fort, defender.fort) / attacker.fort.faction.unit_travel_speed);
    const def_repro_per_frame = defender.fort.faction.unit_reproduction_per_second / (1000 / delta_time);

    const enemy_after_time_to_travel_hp:number = (time_to_travel * def_repro_per_frame < defender.fort.faction.fort_reproduction_unit_limit ?
        time_to_travel * def_repro_per_frame : 
        defender.fort.faction.fort_reproduction_unit_limit) + defender.defense_power;

    points -= +(defender.fort.faction === defender.fort.faction.battleField.player_faction()) * 200;
    if(attacker.fort.faction !== defender.fort.faction && defender.en_route_from_player === 0) {
        points += (attacker.defense_power);
        points -= (enemy_after_time_to_travel_hp + defender.defense_leaving_forces / 2) + attacker.attacking_force;
        points -= time_to_travel * 2;
        //points += 25;
    }
    points -= defender.attacking_force;
    //points += hp_by_faction.get(attacker.fort.faction)!;

    return points;
}
function calc_points_move_early_game(attacker:FortAggregate, defender:FortAggregate, delta_time:number, hp_by_faction:Map<Faction, number>, board_power:number):number
{
    let points = 0;
    const time_to_travel:number = (distance(attacker.fort, defender.fort) / attacker.fort.faction.unit_travel_speed);
    const def_repro_per_frame = defender.fort.faction.unit_reproduction_per_second / (1000 / delta_time);

    const enemy_after_time_to_travel_hp:number = (time_to_travel * def_repro_per_frame < defender.fort.faction.fort_reproduction_unit_limit ?
        time_to_travel * def_repro_per_frame : 
        defender.fort.faction.fort_reproduction_unit_limit) + defender.defense_power;
    if (attacker.fort.faction !== defender.fort.faction && defender.en_route_from_player === 0) {
        if(defender.fort.faction === defender.fort.faction.battleField.factions[0])
            points += (attacker.defense_power);
        points -= (enemy_after_time_to_travel_hp + defender.defense_leaving_forces / 2) + attacker.attacking_force;
        points -= defender.attacking_force;
        points -= time_to_travel;
    }
    else
    {
        points = -10000;
    }
    points -= +(defender.fort.faction === defender.fort.faction.battleField.player_faction()) * 400;
    //points += hp_by_faction.get(attacker.fort.faction)!;

    return points;
}
class Cell {
    units:Unit[];
    barriers:Barrier[]
    constructor(field:BattleField)
    {
        this.units = [];
        this.barriers = [];
    }
    push_unit(unit:Unit):void
    {
        this.units.push(unit);
    }
    push_barrier(barrier:Barrier):void
    {
        this.barriers.push(barrier);
    }
};
class FieldMap {
    data:Cell[];
    faction_index_lookup:Map<Faction, number>;
    field:BattleField;
    reduce_rendered_units:boolean
    constructor(field:BattleField, reduce_rendered_units:boolean)
    {
        this.reduce_rendered_units = reduce_rendered_units;
        this.field = field;
        this.data = [];
        this.faction_index_lookup = new Map<Faction, number>();
        for(let i = 0; i < field.factions.length; i++)
        {
            this.faction_index_lookup.set(field.factions[i], i);
        }
        const sq_dim = 20;
        for(let i = 0; i < sq_dim * sq_dim; i++)
        {
            this.data.push(new Cell(field));
        }
        for(let i = 0; i < field.traveling_units.length; i++)
        {
            const unit = field.traveling_units[i];
            const grid_x = Math.floor(unit.x / field.dimensions[2] * sq_dim);
            const grid_y = Math.floor(unit.y / field.dimensions[3] * sq_dim);
            const cell = this.data[grid_x + grid_y * sq_dim];
            if(cell)
                cell.push_unit(unit);
        }
        for(let i = 0; i < field.barriers.length; i++)
        {
            const barrier = field.barriers[i];
            {
                const grid_x = Math.floor(barrier.x / field.dimensions[2] * sq_dim);
                const grid_y = Math.floor(barrier.y / field.dimensions[3] * sq_dim);
                const cell = this.data[grid_x + grid_y * sq_dim];
                if(cell)
                    cell.push_barrier(barrier);
            }
            {
                const grid_x = Math.floor((barrier.x + barrier.width) / field.dimensions[2] * sq_dim);
                const grid_y = Math.floor((barrier.y + barrier.height)/ field.dimensions[3] * sq_dim);
                const cell = this.data[grid_x + grid_y * sq_dim];
                if(cell)
                    cell.push_barrier(barrier);
            }
        }
    }
    handle_by_cell():void
    {
        for(let i = 0; i < this.data.length; i++)
        {
            this.handle_cell(i);
        }
    }
    handle_cell(index:number):void
    {
        const cell = this.data[index];
        const units = cell.units;
        const barriers = cell.barriers;
        for(let i = 0; i < units.length; i++)
        {
            const unit = units[i];
            for(let j = 0; j < barriers.length; j++)
            {
                const barrier = barriers[j];
                if(barrier.check_collision(unit))
                {
                    barrier.colliding = 30;
                    if(barrier.faction !== unit.faction)
                    {
                            unit.attack(barrier);
                            barrier.attack(unit);
                            unit.render = true;
                            if(barrier.hp <= 0){
                                this.field.barriers.splice(this.field.barriers.indexOf(barrier), 1);
                                barriers.splice(j, 1);
                            }
    
                            if(unit.hp <= 0)
                            {
                                this.field.traveling_units.splice(this.field.traveling_units.indexOf(unit), 1);
                                units.splice(i, 1);
                                break;
                            }
    
                        
                    }
                }
            }
            for(let j = 0; j < units.length; j++)
            {
                const other = units[j];
                if(unit.check_collision(other))
                {
                    if(other.faction !== unit.faction)
                    {
                            unit.attack(other);
                            other.attack(unit);
                            other.render = true;
                            unit.render = true;
                            if(other.hp <= 0){
                                this.field.traveling_units.splice(this.field.traveling_units.indexOf(other), 1);
                                units.splice(j, 1);
                            }
    
                            if(unit.hp <= 0)
                            {
                                this.field.traveling_units.splice(this.field.traveling_units.indexOf(unit), 1);
                                units.splice(i, 1);
                                break;
                            }
    
                        
                    }
                    else if(this.reduce_rendered_units || units.length > 100 && unit.render === true && other.render === true)//they are of the same faction, and are being rendered
                    {
                        
                        if(unit.targetFort === other.targetFort && manhattan_distance(unit, other) < unit.width*0.5)
                        {
                                unit.render = false;
                                other.render = true;
                        }
                    }
                }
            }
        }
        
    }

};
const barrier_sprite = new ImageContainer("barrier", "./images/barrier.png");
const barrier_invalid_sprite = new ImageContainer("barrier invalid", "./images/barrier_invalid.png");
const barrier_colliding_sprite = new ImageContainer("barrier colliding", "./images/barrier_colliding.png");
class Barrier extends SquareAABBCollidable implements Attackable {
    faction:Faction;
    hp:number;
    colliding:number;
    constructor(field:BattleField, faction:Faction, x:number, y:number)
    {
        super(x, y, field.fort_dim / 2, field.fort_dim / 2);
        this.faction = faction;
        this.hp = faction.barrier_start_hp;
        this.colliding = 0;
    }
    attack(enemy: Attackable): void {
        enemy.lose_hp(this.faction.barrier_attack * (1 - enemy.defense()), this);
    }
    offense(): number {
        return this.faction.barrier_attack;
    }
    defense(): number {
        return this.faction.fort_defense;
    }
    lose_hp(hp: number, enemy: Attackable): void {
        this.hp -= hp;
    }
    get_faction(): Faction {
        return this.faction;
    }
    draw(ctx:CanvasRenderingContext2D):void
    {
        if(this.colliding > 0)
        {
            this.colliding--;
            if(barrier_colliding_sprite.image)
            ctx.drawImage(barrier_colliding_sprite.image, this.x, this.y, this.width, this.height);
        }
        else if(barrier_sprite.image)
            ctx.drawImage(barrier_sprite.image, this.x, this.y, this.width, this.height);
    }
};
class BattleField {
    factions:Faction[];
    player_faction_index:number;
    no_ownership_unit_limit:number;
    forts:Fort[];
    traveling_units:Unit[];
    dimensions:number[];
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    fort_dim:number;
    game:Game;
    barriers_limit:number;
    barriers_count:number;
    barriers:Barrier[];
    //has all the forts
    //forts know what faction owns them, how many units they have
    //units know what faction they belong to from there they derive their attack/defense
    //has list of factions
    //factions have offense/defense stats all owned forts take on, and attacking units take on
    constructor(game:Game, dimensions:number[], factions:Faction[], fort_dim:number, fort_count:number)
    {
        this.game = game;
        this.factions = [];
        this.forts = [];
        this.barriers_limit = 10;
        this.barriers_count = 0;
        this.barriers = [];
        this.traveling_units = [];
        this.player_faction_index = 1;
        this.fort_dim = fort_dim;
        this.dimensions = dimensions;
        this.canvas = document.createElement("canvas");
        this.canvas.width = dimensions[2];
        this.canvas.height = dimensions[3];
        this.ctx = this.canvas.getContext("2d")!;
        const factions_copy:Faction[] = [];
        for(let i = 0; i < factions.length; i++)
        {
            const to_copy = factions[i];
            to_copy.battleField = this;
            this.factions.push(to_copy);
            if(i !== this.player_faction_index)
                factions_copy.push(to_copy);
        }

        for(let i = 0; i < fort_count - 1; i++)
        {
            const placed_fort:Fort = this.place_random_fort(factions_copy);
            const faction_index = factions_copy.indexOf(placed_fort.faction);
            if(faction_index > 0)
                factions_copy.splice(faction_index, 1);
        }
        this.place_random_fort([this.player_faction()]);
    }
    barrier(faction:Faction, x:number, y:number):Barrier
    {
        const bar = new Barrier(this, faction, x, y);
        bar.x -= bar.width / 2;
        bar.y -= bar.height / 2;
        return bar;
    }
    place_barrier(faction:Faction, x:number, y:number):boolean
    {
        if(this.barriers_count < this.barriers_limit)
        {
            this.barriers_count++;
            this.barriers.push(this.barrier(faction, x, y));
            return true;
        }
        return false;
    }
    time_elapsed():number
    {
        return this.game.time_elapsed();
    }
    player_faction():Faction
    {
        return this.factions[this.player_faction_index];
    }
    draw(canvas:HTMLCanvasElement, ctx:CanvasRenderingContext2D):void
    {
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        if(this.game.background.image)
        {
            const image = this.game.background.image;
            const sq_dim = Math.min(image.width, image.height);
            const mag = Math.sqrt(this.dimensions[2] * this.dimensions[2] + this.dimensions[3] * this.dimensions[3]);
            const norm = [this.dimensions[2] / mag, this.dimensions[3] / mag];
            this.ctx.drawImage(image, 0, 0, sq_dim * norm[0], sq_dim * norm[1], 0, 0, this.dimensions[2], this.dimensions[3]);
        }
        this.forts.forEach(fort => fort.draw(this.canvas, this.ctx));
        ctx.strokeStyle = "#000000";
        for(let i = 0; i < this.traveling_units.length; i++)
        {
            const unit = this.traveling_units[i];
            unit.draw(this.canvas, this.ctx);
        }
        this.barriers.forEach(barrier => {
            barrier.draw(this.ctx);
        });
        ctx.drawImage(this.canvas, this.dimensions[0], this.dimensions[1]);
    }
    handleAI(delta_time:number):void
    {
        let records:FortAggregate[] = [];
        let hp_by_faction_index = this.game.hp_by_faction();
        let sum_power = 0;
        const hp_by_faction_map = new Map<Faction, number>();
        const fort_index_lookup:Map<Fort, number> = new Map();
        for(let i = 0; i < hp_by_faction_index.length; i++)
        {
            hp_by_faction_map.set(this.factions[i], hp_by_faction_index[i]);
            sum_power += hp_by_faction_index[i];
        }
        for(let i = 0; i < this.forts.length; i++)
        {
            const fort:Fort = this.forts[i];
            fort_index_lookup.set(fort, i);
            const record:FortAggregate = new FortAggregate(fort, 0, 0);
            for(let j = 0; j < fort.units.length; j++)
            {
                const unit = fort.units[j];
                record.defense_power += unit.hp * (1 + fort.faction.fort_defense);
            }
            for(let j = 0; j < fort.leaving_units.length; j++)
            {
                const unit = fort.leaving_units[j];
                record.defense_leaving_forces += unit.hp * (1 + fort.faction.fort_defense);

                const fort_index:number = fort_index_lookup.get(unit.targetFort)!;
                if(unit.targetFort.get_faction() !== unit.faction)
                {
                    record.attacking_force += unit.hp * (1 + unit.faction.unit_defense);
                }
                else
                {
                    record.defense_force_inbound += unit.hp * (1 + unit.faction.unit_defense);
                }
            }
            records.push(record);
        }
        for(let i = 0; i < this.traveling_units.length; i++)
        {
            const unit = this.traveling_units[i];
            const fort_index:number = fort_index_lookup.get(unit.targetFort)!;
            if(unit.targetFort.get_faction() !== unit.faction)
            {
                records[fort_index].attacking_force += unit.hp * (1 + unit.faction.unit_defense);
            }
            else
            {
                records[fort_index].defense_force_inbound += unit.hp * (1 + unit.faction.unit_defense);
            }

            if(unit.faction === unit.faction.battleField.player_faction())
            {
                records[fort_index].en_route_from_player +=  unit.hp;
            }

        }
        let calc_points = calc_points_move_early_game;
        if(this.time_elapsed() > 15 * 1000)
        {
            calc_points = calc_points_move_mid_game;
        }
        else if(this.time_elapsed() > 23 * 1000)
        {
            calc_points = calc_points_move;
        }
        for(let i = 0; i < records.length; i++)
        {
            const record:FortAggregate = records[i];
            if(record.fort.faction !== this.factions[0] && record.fort.faction !== this.factions[1])
            {
                //not no faction, and not player
                let max_points:number = calc_points(record, records[0], delta_time, hp_by_faction_map, sum_power);
                let max_index:number = 0;
                for(let j = 1; j < records.length; j++)
                {
                    const points:number = calc_points(record, records[j], delta_time, hp_by_faction_map, sum_power);
                    if(max_points < points)
                    {
                        max_points = points;
                        max_index = j;
                    }
                }
                if((max_points - record.fort.faction.avg_move_value) > 25)
                {
                    record.fort.faction.sum_move_points += max_points;
                    record.fort.faction.count_moves++;
                    record.fort.faction.avg_move_value = record.fort.faction.sum_move_points / record.fort.faction.count_moves;
                
                    if(max_points > 10 && record.fort !== records[max_index].fort)
                    {
                        record.fort.auto_send_units(records[max_index].fort);
                    }
                    if(record.fort.faction.avg_move_value > 1550)
                    {
                        record.fort.faction.sum_move_points = 650 * record.fort.faction.count_moves;
                        record.fort.faction.avg_move_value = 650;
                    }
                }
                else if(record.fort.units.length >= record.fort.faction.fort_reproduction_unit_limit && record.fort !== records[max_index].fort)
                {
                    //if(max_points > 100)
                    {
                        record.fort.auto_send_units(records[max_index].fort);
                    }
                }
            }
        }
    }
    update_state(delta_time:number):void
    {
        this.forts.forEach(fort => fort.update_state(delta_time));
        for(let i = 0; i < this.traveling_units.length; i++)
        {
            const unit = this.traveling_units[i];
            if(!unit.update_state(delta_time))
            {
                this.traveling_units.splice(i, 1);
            }
        }
        const collision_checker = new FieldMap(this, this.traveling_units.length > 1200);
        collision_checker.handle_by_cell();
        this.handleAI(delta_time);
    }
    check_fort_collision(object:SquareAABBCollidable):boolean
    {
        for(let i = 0; i < this.forts.length; i++)
        {
            if(object.check_collision(this.forts[i]))
                return true;
        }
        return false;
    }
    check_valid_fort_position(fort:Fort):boolean
    {
        if(this.check_fort_collision(fort))
            return false;
        
        if(fort.x < 0 || fort.x + fort.width > this.dimensions[2] || fort.y < 0 || fort.y + fort.width > this.dimensions[3])
            return false;
        
        return true;
    }
    place_random_fort(factions:Faction[] = this.factions):Fort
    {
        if(factions.length)
        {
            const x = Math.floor(random() * (this.dimensions[2] - this.fort_dim) + this.dimensions[0]);
            const y = Math.floor(random() * (this.dimensions[3] - this.fort_dim * 1.5) + this.dimensions[1]);
            const owner = random() < 0.5 ? 0 : Math.floor(random() * factions.length);
            const fort = new Fort(factions[owner], x, y, this.fort_dim, this.fort_dim);
            if(!this.check_valid_fort_position(fort))
            {
                this.place_random_fort(factions);
            }
            else
            {
                this.forts.push(fort);
            }
            return fort;
        }
        throw "Error no factions instantiated";
    }
    place_fort(faction:Faction, x:number, y:number):Fort
    {
        this.forts.push(new Fort(faction, x, y, this.fort_dim, this.fort_dim));
        return this.forts[this.forts.length - 1];
    }
    find_nearest_fort(x:number, y:number):Fort
    {
        let found:Fort = this.forts[0];
        const point = new SquareAABBCollidable(x, y, 1, 1);
        for(let i = 1; i < this.forts.length; i++)
        {
            if(distance(found, point) > distance(this.forts[i], point)){
                found = this.forts[i];
            }
        }
        return found;
    }
};

class UpgradePanel extends SimpleGridLayoutManager {
    attribute_name:string;
    display_name:GuiTextBox;
    display_value:GuiButton;
    frame:UpgradeScreen;
    alt_text:() =>string;
    increase_function:null | ((x:number) => number);

    constructor(next:(x:number) => number, frame:UpgradeScreen, attribute_name:string, short_name:string, pixelDim:number[], x:number, y:number, alt_text:() => string = () => "", callback:() => void = () => this.default_upgrade_callback())
    {
        super([1, 200], pixelDim, x, y);
        this.frame = frame;
        this.alt_text = alt_text;
        const fontSize = isTouchSupported() ? 27:22;
        this.increase_function = next;
        this.attribute_name = attribute_name;
        this.display_value = new GuiButton(callback, this.get_value() + "", pixelDim[0], fontSize * 2 + 20, fontSize + 2);
        this.display_name = new GuiTextBox(false, pixelDim[0], this.display_value, fontSize, fontSize * 2, GuiTextBox.default);
        
        this.display_name.setText(short_name);
        this.display_name.refresh();
        this.display_value.refresh();
        this.createHandlers(this.frame.game.keyboard_handler, this.frame.game.touch_listener);
        this.addElement(this.display_name);
        this.addElement(this.display_value);
        this.setHeight(this.display_name.height() + this.display_value.height() + 5);
    }
    default_upgrade_callback():void
    {
        this.increment_attribute();
        this.display_value.text = this.get_value() + "";
        this.display_value.refresh();
        this.frame.game.maybe_new_upgrade();
    }
    update_display_value():void
    {
        this.display_value.text = this.get_value() + "";
        this.display_value.refresh();
    }
    increment_attribute():void
    {
        if(this.increase_function)
        {
            this.frame.faction[this.attribute_name] += this.increase_function(this.frame.faction[this.attribute_name]);
        }
    }
    get():number | undefined
    {
        return this.frame.faction[this.attribute_name];
    }
    get_value():number|string
    {
        if(this.frame.faction[this.attribute_name] !== undefined && this.alt_text() === "")
            return Math.round(this.frame.faction[this.attribute_name] * 1000) / 1000;
        else
            return this.alt_text();
    }
    
};
class UpgradeScreen extends SimpleGridLayoutManager {
    faction:Faction;
    upgrade_panels:UpgradePanel[];
    play_group:UpgradePanel;
    game:Game;
    constructor(faction:Faction, game:Game, pixelDim:number[], x:number, y:number)
    {
        super([6, 40], pixelDim, x, y);
        this.upgrade_panels = [];
        this.faction = faction;
        this.game = game;
        let diff_log = (x:number, offset:number = 0) => Math.log(x + 1 + offset) - Math.log(x + offset);
        const panel_height = pixelDim[1] / 3;
        const panel_width = Math.floor(pixelDim[0] / 3);
        const header_height = 96 + 12;
        const header_label = new GuiButton(() => {}, "Forts", panel_width * 2, header_height, 96);
        header_label.unPressedColor = new RGB(255,255,255,100);
        this.addElement(new GuiSpacer([panel_width / 2, header_height]));
        this.addElement(header_label);
        this.addElement(new GuiSpacer([panel_width / 2, header_height]));
        //this.setHeight();
        const attack = new UpgradePanel((x:number) => 0.3, this, "attack", "Attack", [panel_width, panel_height], 0, 0);
        this.addElement(attack);
        this.upgrade_panels.push(attack);
        this.setHeight(attack.height() * 3 + header_label.height() + 30);
    {
        const upgrades = new UpgradePanel((x:number) => diff_log(x, 14), this, "unit_reproduction_per_second", "Production", [panel_width, panel_height], 0, 0);
        this.addElement(upgrades);
        this.upgrade_panels.push(upgrades);
    }
    {
        const upgrades = new UpgradePanel((x:number) => diff_log(x, 100), this, "unit_defense", "UDefense", [panel_width, panel_height], 0, 0);
        upgrades.alt_text = () => Math.round(upgrades.get()! * 100)+"%";
        
        this.addElement(upgrades);
        this.upgrade_panels.push(upgrades);
    }

    {
        const upgrades = new UpgradePanel((x:number) => diff_log(x, 95), this, "fort_defense", "FDefense", [panel_width, panel_height], 0, 0);
        upgrades.alt_text = () => Math.round(upgrades.get()! * 100)+"%";
        this.addElement(upgrades);
        this.upgrade_panels.push(upgrades);
    }

    {
        const upgrades = new UpgradePanel((x:number) => 0.3, this, "starting_unit_hp", "HP", [panel_width, panel_height], 0, 0);
        this.addElement(upgrades);
        this.upgrade_panels.push(upgrades);
    }
    {
        const upgrades = new UpgradePanel((x:number) => Math.max(pixelDim[1], pixelDim[0]) / 100, this, "unit_travel_speed", "Unit\nSpeed", [panel_width, panel_height], 0, 0);
        this.addElement(upgrades);
        this.upgrade_panels.push(upgrades);
    }
    {
        const level_toggle = new UpgradePanel((x:number) => pixelDim[1] / 100, this, "null", "Levels", [panel_width, panel_height], 0, 0, () => game.difficulty + "",
        () => {game.difficulty = (game.difficulty + 1) % 10; 
            level_toggle.update_display_value();
            level_toggle.activate();} );
        
        this.addElement(level_toggle);
        this.upgrade_panels.push(level_toggle);
    }
    {
        const upgrades = new UpgradePanel((x:number) => pixelDim[1] / 100, this, "null", "Play!", [panel_width, panel_height], 0, 0, () => "Play Game!", () => this.game.new_game());
        upgrades.increase_function = null;
        this.play_group = upgrades;
        this.addElement(upgrades);
        this.upgrade_panels.push(upgrades);
    }

    {
        const joint_move_toggle = new UpgradePanel((x:number) => pixelDim[1] / 100, this, "null", "Joint Moves", [panel_width, panel_height], 0, 0, () => game.joint_attack_mode + "",
        () => {game.joint_attack_mode = !game.joint_attack_mode; joint_move_toggle.update_display_value(); joint_move_toggle.activate()});
        
        this.addElement(joint_move_toggle);
        this.upgrade_panels.push(joint_move_toggle);
    }
        this.refresh();

    }
};

class Game {
    currentField:BattleField;
    factions:Faction[];
    start_touch_forts:Fort[];
    end_touch_fort:Fort|null;
    upgrade_menu:UpgradeScreen;
    touch_listener:SingleTouchListener;
    keyboard_handler:KeyboardHandler;
    game_over:boolean;
    board_cache:HTMLCanvasElement
    mouse_down_tracker:MouseDownTracker;
    game_start:number;
    dev_mode:boolean;
    joint_attack_mode:boolean;
    wins:number;
    losses:number
    difficulty:number;
    background:ImageContainer;
    control_state_toggle_group:SimpleGridLayoutManager;
    regular_control:boolean;
    
    constructor(canvas:HTMLCanvasElement)
    {
        this.background = new ImageContainer("background", `./images/${"background"}.png`)
        this.dev_mode = false;
        this.joint_attack_mode = false;
        this.regular_control = true;
        this.difficulty = 0;
        this.wins = 0;
        this.losses = 0;
        this.factions = [];
        this.start_touch_forts = [];
        const width = canvas.width;
        const height = canvas.height;
        this.game_start = Date.now();
        this.mouse_down_tracker = new MouseDownTracker();
        this.factions.push(new Faction("none", new RGB(125, 125, 125), 20));
        this.factions[0].attack = 2;
        this.factions[0].unit_reproduction_per_second = 1;
        this.game_over = true;
        srand(Math.random() * max_32_bit_signed);
        // seeds 607, 197 are pretty good so far lol
        for(let i = 0; i < 5; i++)
        {
            this.factions.push(new Faction("faction" + i, new RGB(random() * 128 + 128, random() * 128 + 128, random() * 128 + 128), 120, true));
        }
        this.factions[1].unit_reproduction_per_second += 0.3;
        this.currentField = new BattleField(this, [0, 0, width, height], this.factions, Math.max(width, height) / (isTouchSupported() ? 11 : 15), 10);
        //this.factions[0].battleField = this.currentField;
        const is_player = (e:any) => this.currentField.find_nearest_fort(e.touchPos[0], e.touchPos[1]).faction === this.currentField.player_faction()
        this.keyboard_handler = new KeyboardHandler();
        this.touch_listener = new SingleTouchListener(canvas, true, true, false);
        this.touch_listener.registerCallBack("touchstart", (e:any) => !this.regular_control, (e:any) => {
            const point = new SquareAABBCollidable(e.touchPos[0], e.touchPos[1], 1, 1);
            if(!point.check_collision_gui(this.control_state_toggle_group, 
                this.control_state_toggle_group.x, this.control_state_toggle_group.y))
            {
                this.currentField.place_barrier(this.currentField.player_faction(), e.touchPos[0], e.touchPos[1]);
            }
        });
        this.touch_listener.registerCallBack("touchstart", (e:any) => is_player(e) && this.regular_control, (event:any) => {
            this.start_touch_forts.splice(0, this.start_touch_forts.length);
            const nearest_fort = this.currentField.find_nearest_fort(event.touchPos[0], event.touchPos[1]);
            if(nearest_fort.faction === this.currentField.player_faction())
                this.start_touch_forts.push(nearest_fort);
        });
        const end_selection_possible = (e:any) => this.start_touch_forts.length !== 0;
        this.touch_listener.registerCallBack("touchmove", (e:any) => end_selection_possible(e) && this.joint_attack_mode && this.regular_control, (event:any) =>{
            const nearest_fort = this.currentField.find_nearest_fort(event.touchPos[0], event.touchPos[1]);
            this.end_touch_fort = nearest_fort;
            if(nearest_fort.faction === this.currentField.player_faction())
                this.start_touch_forts.push(nearest_fort);
        });
        this.touch_listener.registerCallBack("touchmove", (e:any) => end_selection_possible(e) && !this.joint_attack_mode && this.regular_control, (event:any) =>{
            const nearest_fort = this.currentField.find_nearest_fort(event.touchPos[0], event.touchPos[1]);
            this.end_touch_fort = nearest_fort;
        });
        this.touch_listener.registerCallBack("touchend", (e:any) => end_selection_possible(e) && this.regular_control, (event:any) => {
            this.end_touch_fort = this.currentField.find_nearest_fort(event.touchPos[0], event.touchPos[1]);
            for(let i = 0; i < this.start_touch_forts.length; i++)
            {
                const start_fort = this.start_touch_forts[i];
                if(start_fort.faction === this.currentField.player_faction())
                {
                    if(start_fort === this.end_touch_fort)
                    {
                        start_fort.unsend_units();
                    }
                    else
                    {
                        start_fort.send_units(this.end_touch_fort);
                    }
                }
            }
            this.end_touch_fort = null;
        });
        this.upgrade_menu = new UpgradeScreen(this.currentField.player_faction(), this, [canvas.width * 7/8, canvas.height * 1/2], canvas.width / 16, canvas.height / 8);
        this.upgrade_menu.refresh();
        this.keyboard_handler.registerCallBack("keydown", (e:any) => {return this.keyboard_handler.keysHeld["KeyJ"]}, 
        (e:any) =>{
            this.joint_attack_mode = !this.joint_attack_mode;
        });
        this.currentField.update_state(1);
        window.addEventListener("load", () => setTimeout(() => this.currentField.draw(canvas, canvas.getContext("2d")!), 250));
        this.control_state_toggle_group = new SimpleGridLayoutManager([1, 1], [this.currentField.fort_dim * 2, this.currentField.fort_dim * 3/4]);
        this.control_state_toggle_group.x = this.currentField.dimensions[2] - this.control_state_toggle_group.pixelDim[0];
        this.control_state_toggle_group.y = this.currentField.dimensions[3] - this.control_state_toggle_group.pixelDim[1];
        const b_state = "Place Barriers";
        const c_state = "Control Game"
        const button_barriers = new GuiButton(() =>{}, c_state, this.control_state_toggle_group.pixelDim[0]);
        button_barriers.callback = () => {
            if(button_barriers.text === b_state){
                button_barriers.text = c_state;
                this.regular_control = true;
            }
            else
            {
                button_barriers.text = b_state;
                this.regular_control = false;
            }
        };
        this.control_state_toggle_group.addElement(button_barriers);
        this.control_state_toggle_group.createHandlers(this.keyboard_handler, this.touch_listener);

    }
    is_faction_on_field(faction:Faction):boolean
    {
        let counter = 0;
        while(counter < this.currentField.forts.length)
        {
            if(this.currentField.forts[counter].faction === faction)
            {
                break;
            }
            counter++;
        }
        return counter !== this.currentField.forts.length;
    }
    upgrade_ai_factions():void
    {
        this.factions[0].auto_upgrade();
        for(let i = 2; i < this.factions.length; i++)
        {
            this.factions[i].auto_upgrade();
        }
    }
    end_game():void
    {
        for(let i = 0; i < this.difficulty; i++)
            this.upgrade_ai_factions();
        
        if(this.is_faction_on_field(this.currentField.player_faction()))
        {
            this.wins++;
        }
        else
        {
            this.losses++;
        }
    }
    update_state(delta_time:number):void
    {
        if(this.game_over)
        {
            if(!this.upgrade_menu.active())// only once per game over this if will be true
            {
                this.upgrade_menu.activate();
                this.end_game();
            }
        }
        else
        {
            this.currentField.update_state(delta_time);
            this.game_over = this.is_game_over();
        }
    }
    draw(canvas:HTMLCanvasElement, ctx:CanvasRenderingContext2D):void
    {
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(this.currentField.dimensions[0], this.currentField.dimensions[1], this.currentField.dimensions[2], this.currentField.dimensions[3]);
        if(!this.game_over)
        {
            this.currentField.draw(canvas, ctx);
            if(this.regular_control)
            {
                if(this.mouse_down_tracker.mouseDown && this.start_touch_forts.length && this.end_touch_fort)
            {
                ctx.strokeStyle = new RGB(125, 125, 125, 125).htmlRBGA();
                ctx.lineWidth = 15;
                ctx.beginPath();
                for(let i = 0; i < this.start_touch_forts.length; i++)
                {
                    const start_fort = this.start_touch_forts[i]!;
                    const end_fort = this.end_touch_fort;
                    const odx = start_fort.mid_x() - end_fort.mid_x();
                    const ody = start_fort.mid_y() - end_fort.mid_y();
                    const dist = Math.sqrt(odx*odx + ody*ody);
                    const ndx = odx / dist;
                    const ndy = ody / dist;
                    let sx = start_fort.mid_x() - ndx * this.currentField.fort_dim;
                    let sy = start_fort.mid_y() - ndy * this.currentField.fort_dim;
                    if(Math.sqrt(odx*odx + ody*ody) <= this.currentField.fort_dim)
                    {
                        sx = start_fort.mid_x();
                        sy = start_fort.mid_y();
                    }
                    ctx.moveTo(sx, sy);
                    ctx.lineTo(end_fort.mid_x() + ndx * (this.currentField.fort_dim), end_fort.mid_y() + ndy * (this.currentField.fort_dim));
                    ctx.moveTo(end_fort.mid_x() + this.currentField.fort_dim, end_fort.mid_y());
                    ctx.arc(end_fort.mid_x(), end_fort.mid_y(), this.currentField.fort_dim, 0, 2 * Math.PI);
                }
                
                ctx.stroke();
                }
            }
            else
            {
                const barrier = this.currentField.barrier(this.currentField.player_faction(), this.touch_listener.touchPos[0], this.touch_listener.touchPos[1]);
                if(this.currentField.barriers_count < this.currentField.barriers_limit && barrier_sprite.image)
                {
                    ctx.drawImage(barrier_sprite.image, barrier.x, barrier.y, barrier.width, barrier.height);
                }
                else if(barrier_invalid_sprite.image)
                {
                    ctx.drawImage(barrier_invalid_sprite.image, barrier.x, barrier.y, barrier.width, barrier.height);
                }
            }
        }
        else 
        {
            ctx.drawImage(this.currentField.canvas, this.currentField.dimensions[0], this.currentField.dimensions[1]);
            this.upgrade_menu.draw(ctx);
        }
        this.control_state_toggle_group.activate();
        this.control_state_toggle_group.refresh();
        this.control_state_toggle_group.draw(ctx);
    }
    time_elapsed():number
    {
        return Date.now() - this.game_start;
    }
    find_non_null_fort_faction():Faction | null
    {
        let faction:Faction|null = this.currentField.forts[0].faction;
        let i = 1;
        while(faction === this.factions[0])
        {
            faction = this.currentField.forts[i] ? this.currentField.forts[i].faction : null;
            i++;
        }
        return faction;
    }
    hp_by_faction():number[]
    {
        let unit_counts:number[] = [];
        const faction_map = new Map<Faction, number>();
        for(let i = 0; i < this.factions.length; i++)
        {
            unit_counts.push(0);
            faction_map.set(this.factions[i], i);
        }
        for(let i = 0; i < this.currentField.forts.length; i++)
        {
            const fort = this.currentField.forts[i];
            const faction_index = faction_map.get(fort.faction)!;
            for(let j = 0; j < fort.units.length; j++)
            {
                const unit = fort.units[j];
                unit_counts[faction_index] += unit.hp;
            }
            for(let j = 0; j < fort.leaving_units.length; j++)
            {
                const unit = fort.leaving_units[j];
                unit_counts[faction_index] += unit.hp;
            }
        }
        for(let i = 0; i < this.currentField.traveling_units.length; i++)
        {
            const unit = this.currentField.traveling_units[i];
            const faction_index = faction_map.get(unit.faction)!;
            unit_counts[faction_index] += unit.hp;
        }
        return unit_counts;
    }
    player_fort_count():number
    {
        let count = 0;
        for(let i = 0; i < this.currentField.forts.length; i++)
        {
            count += +(this.currentField.forts[i].faction === this.currentField.player_faction());
            //count += +(this.currentField.forts[i].faction === this.currentField.factions[0]);
        }
        return count;
    }
    null_fort_count():number
    {
        let count = 0;
        for(let i = 0; i < this.currentField.forts.length; i++)
        {
            count += +(this.currentField.forts[i].faction === this.currentField.factions[0]);
            //count += +(this.currentField.forts[i].faction === this.currentField.factions[0]);
        }
        return count;
    }
    is_game_over():boolean
    {
        const data = this.hp_by_faction();
        let sum = 0;
        for(let i = 2; i < data.length; i++)
        {
            sum += data[i];
        }
        const pfc = this.player_fort_count();
        const nfc = this.null_fort_count();
        if(pfc === 0 && data[this.currentField.player_faction_index] === 0)
        {
            return true;
        }
        if(pfc + nfc === this.currentField.forts.length && sum === 0)
            return true;
        return false;
    }
    maybe_new_upgrade():boolean
    {
        if(random() < 0.66)
        {
            this.upgrade_menu.activate();
            return true;
        }
        let i = 3;
        for(; i < this.upgrade_menu.elements.length - 3; i++)
        {
            const el = this.upgrade_menu.elements[i];
            el.deactivate();
        }
        return false;
    }
    maybe_new_game():boolean
    {
        if(random() > 0.33)
        {
            this.new_game();
            return true;
        }
        return false;
    }
    new_game():void
    {
        this.start_touch_forts = [];
        this.end_touch_fort = null;
        this.upgrade_menu.deactivate();
        this.game_over = false;
        this.game_start = Date.now();
        this.currentField = new BattleField(this, this.currentField.dimensions, this.factions, this.currentField.fort_dim, 10);
    }
}
async function main()
{
    const canvas:HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("screen");
    let maybectx:CanvasRenderingContext2D | null = canvas.getContext("2d");
    if(!maybectx)
        return;
    const ctx:CanvasRenderingContext2D = maybectx;
    
    const keyboardHandler:KeyboardHandler = new KeyboardHandler();


    canvas.onmousemove = (event:MouseEvent) => {
    };
    canvas.addEventListener("wheel", (e) => {
        //e.preventDefault();
    });

    //setup rendering canvas, and view
    canvas.width = getWidth();
    canvas.height = getHeight();
    canvas.style.cursor = "pointer";
    let counter = 0;
    const touchScreen:boolean = isTouchSupported();
    const game_local = new Game(canvas);
    window.game = game_local;
    window.player_faction = game_local.currentField.player_faction();
    window.factions = window.game.factions;
    let start = Date.now();
    let dt = 1;
    const drawLoop = () => 
    {
        dt += Date.now() - start;
        start = Date.now();
        game_local.update_state(dt);
        game_local.draw(canvas, ctx);
        dt = Date.now() - start;
        start = Date.now();
        requestAnimationFrame(drawLoop);
    }
    drawLoop();

}
main();
window.RGB = RGB;
window.send_units = (from:number, to:number) => window.game.currentField.forts[from].send_units(window.game.currentField.forts[to])
window.super_charged = () => {
    for(let i = 0; i < window.factions.length; i++)
    {
        const faction:Faction = window.factions[i];
        faction.unit_reproduction_per_second += 5;
    }
    factions[0].attack = 4.5;
    player_faction.unit_reproduction_per_second += 5;
}

//toggle hard mode  //hard mode has ai upgrade 2x for every player upgrade
//toggle joint control mode