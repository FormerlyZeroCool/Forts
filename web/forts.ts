import {SingleTouchListener, MouseDownTracker, isTouchSupported, KeyboardHandler} from './io.js'
import {SimpleGridLayoutManager, GuiTextBox, GuiButton, GuiSpacer, getHeight, getWidth, RGB, ImageContainer, Sprite, GuiElement} from './gui.js'
import {random, srand, max_32_bit_signed, get_angle, logToServer, logBinaryToServer, readFromServer, sleep} from './utils.js'

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

    
    constructor(name:string, color:RGB, fort_reproduction_unit_limit:number, base_unit_speed:number, load_image:boolean = false)
    {
        this.name = name;
        this.attack = 9 * (1 + random() / 5);
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
        this.unit_travel_speed = base_unit_speed * (1 + random() / 5);
        this.barrier_start_hp = 1000;
        this.barrier_attack = 1.2;
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
            const dy:number = (-this.mid_y() + this.targetFort.mid_y()) / this.faction.battleField.host_vertical_ratio;
            const dx:number = (-this.mid_x() + this.targetFort.mid_x()) / this.faction.battleField.host_horizontal_ratio;
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
        this.last_update_units_leaving = 0;
        this.units = [];
        this.leaving_units = [];
        this.font_size = Math.ceil(this.faction.battleField.fort_dim * 3/8);
        this.font_name = "Helvetica";
    }
    update_state(delta_time:number):void
    {
        //reproduce new units
        if(this.faction.battleField.game.session.is_host)
        if(this.units.length + this.leaving_units.length < this.faction.fort_reproduction_unit_limit && Date.now() - this.last_update_unit_reproduction > (1000 / this.faction.unit_reproduction_per_second))
        {
            const head = this.units.pop();
            this.units.push(new Unit(this.faction, this, this.mid_x(), this.mid_y()));
            if(head)
                this.units.push(head);
            
            this.last_update_unit_reproduction = Date.now();
        }
        this.timed_send()
    }
    timed_send():void
    {
        //send out leaving units
        if(Date.now() - this.last_update_units_leaving > 100 && this.faction.battleField.traveling_units.length < this.faction.battleField.max_traveling_units)
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
            const dx = Math.ceil(barrier.width / field.dimensions[2] * sq_dim);
            const dy = Math.ceil(barrier.height / field.dimensions[3] * sq_dim);
            {
                const grid_x = Math.floor((barrier.x - barrier.width / 2) / field.dimensions[2] * sq_dim);
                const grid_y = Math.floor((barrier.y - barrier.width / 2) / field.dimensions[3] * sq_dim);
                for(let y = 0; y < dy; y++)
                {
                    for(let x = 0; x < dx; x++)
                    {
                        const cell = this.data[grid_x + x + (grid_y + y) * sq_dim];
                        if(cell)
                            cell.push_barrier(barrier);
                    }
                }
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
                    if(barrier.faction !== unit.faction)
                    {
                        barrier.colliding = 30;
                        unit.attack(barrier);
                        barrier.attack(unit);
                        if(barrier.hp <= 0){
                            const barrier_index = this.field.barriers.indexOf(barrier);
                            if(barrier_index !== -1)
                                this.field.barriers.splice(barrier_index, 1);
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
                    else if(this.reduce_rendered_units || units.length > this.field.max_units_per_cell && unit.render === true && other.render === true)//they are of the same faction, and are being rendered
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
    unused_barriers:Barrier[];
    barriers:Barrier[];

    max_traveling_units:number;
    max_units_per_cell:number;
    host_horizontal_ratio:number;
    host_vertical_ratio:number;
    //has all the forts
    //forts know what faction owns them, how many units they have
    //units know what faction they belong to from there they derive their attack/defense
    //has list of factions
    //factions have offense/defense stats all owned forts take on, and attacking units take on
    constructor(game:Game, dimensions:number[], factions:Faction[], fort_dim:number, fort_count:number)
    {
        this.host_horizontal_ratio = 1;
        this.host_vertical_ratio = 1;
        this.game = game;
        this.max_traveling_units = 1200;
        this.max_units_per_cell = 10;
        this.factions = [];
        this.forts = [];
        this.unused_barriers = [];
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
            const placed_fort:Fort = this.place_random_fort([this.factions[0]]);
        }
        for(let i = 0; i < this.factions.length; i++)
        {
            this.place_random_fort([this.factions[i]]);
        }

        for(let i = 0; i < fort_count * 2; i++)
        {
            this.unused_barriers.push(new Barrier(this, this.player_faction(), 0, 0));
        }
    }
    get_faction_index_map():Map<Faction, number>
    {
        const map = new Map<Faction, number>();
        for(let i = 0; i < this.factions.length; i++)
        {
            map.set(this.factions[i], i);
        }
        return map;
    }
    get_fort_index_map():Map<Fort, number>
    {
        const map = new Map<Fort, number>();
        for(let i = 0; i < this.forts.length; i++)
        {
            map.set(this.forts[i], i);
        }
        return map;
    }
    normalize_as_int(dim:number[]):number[]
    {
        return [dim[0] / this.width() * 10000, dim[1] / this.height() * 10000];
    }
    normals_to_point(dim:number[]):number[]
    {
        return [dim[0] / 10000 * this.width(), dim[1] / 10000 * this.height()];
    }
    encode_display_data_state():number[]
    {
        const file_size_header_size = 1;
        const game_id_and_host_info = 2;
        const screen_dim = 1;
        const fort_count_size = 1;
        const unit_count_size = 1;
        const barrier_count_size = 1;
        const faction_data:number = this.factions.length;
        const file_size = /*2 * this.traveling_units.length + */faction_data + screen_dim + game_id_and_host_info + this.barriers.length + 2 * this.forts.length + 
            file_size_header_size + fort_count_size + unit_count_size + barrier_count_size;
        //file header total file length, 
        //fort info fort count, then for each fort owning faction in 4 bits, and count units remaining 28
        //then traveling unit info 
        //total units then per unit 14 bits for x and y, and 3 bits for faction, and 1 bit for whether or not to render
        //barriers 14 bits for x and y, 4 bits for faction
        const data:number[] = [];
        for(let i = 0; i < file_size; i++)
        {
            data.push(-1);
        }

        const faction_map = this.get_faction_index_map();
        const fort_map = this.get_fort_index_map();
        data[0] = file_size;
        data[1] = (this.dimensions[2] << 16) | this.dimensions[3];
        data[2] = this.game.session.game_id;
        data[3] = this.game.session.id;
        data[4] = this.forts.length;
        let i = 5;
        for(let j = 0; j < this.forts.length; j++, i++)
        {
            const norm = this.normalize_as_int([this.forts[j].x, this.forts[j].y]);
            data[i] = (faction_map.get(this.forts[j].faction)! << 28) | (norm[0] << 14) | norm[1];
            i++;
            const targetFort = this.forts[j].leaving_units.length !== 0 ? this.forts[j].leaving_units[0].targetFort : this.forts[j];
            data[i] = (this.forts[j].units.length << 18) | (this.forts[j].leaving_units.length << 4) | fort_map.get(targetFort)!;
        } 
        /*
        data[i++] = this.traveling_units.length;
        for(let j = 0; j < this.traveling_units.length; j++, i++)
        {
            const unit = this.traveling_units[j];
            data[i] = (faction_map.get(unit.faction)! << 28) | (unit.x << 14) | unit.y;
            i++;
            data[i] = (+unit.render << 31) | fort_map.get(unit.targetFort)!;
        }*/
        data[i++] = this.barriers.length;
        for(let j = 0; j < this.barriers.length; j++, i++)
        {
            const barrier = this.barriers[j];
            const norm = this.normalize_as_int([barrier.x, barrier.y]);
            data[i] = (faction_map.get(barrier.faction)! << 28) | (norm[0] << 14) | norm[1];
        }
        for(let j = 0; j < this.factions.length; j++, i++)
        {
            const faction = this.factions[j];
            data[i] = (faction.unit_travel_speed << 16) | (faction.fort_defense << 8) | (faction.unit_defense);
        }
        return data;
    }
    load_encoded_display_state(data:number[]):void
    {
        //this.traveling_units = [];
        this.barriers = [];
        const file_size = data[0];
        const host_width = (data[1] >> 16)  & ((1 << 16) - 1);
        const host_height = data[1] & ((1 << 16) - 1);
        this.host_horizontal_ratio = host_width / this.dimensions[2];
        this.host_vertical_ratio =  host_height / this.dimensions[3];
        this.game.session.game_id = data[2];
        data[3] = this.game.session.id;
        let i = 4;
        const forts_count = data[i++];
        for(let i = 0; i < this.forts.length; i++)
        {
            this.forts[i].units = [];
            this.forts[i].leaving_units = [];
        }
        if(forts_count < this.forts.length)
        {
            this.forts.splice(0, this.forts.length - forts_count);
        }
        for(let i = this.forts.length; i < forts_count; i++)
        {
            this.place_fort(this.factions[0], 0, 0);
        }
        for(let j = 0; j < forts_count; j++, i++)
        {
            const faction = data[i] >> 28;
            const x = (data[i] >> 14) & ((1 << 14) - 1);
            const y = (data[i]) & ((1 << 14) - 1);
            const point = this.normals_to_point([x, y]);
            i++;
            const units = data[i] >> 18;
            const leaving_units = (data[i] >> 4) & ((1 << 14) - 1);
            const target_fort = data[i] & ((1 << 4) - 1);
            const fort = this.forts[j];
            fort.x = point[0];
            fort.y = point[1];
            fort.faction = this.factions[faction];
            for(let j = 0; j < units; j++)
            {
                fort.units.push(new Unit(this.factions[faction], fort, point[0], point[1]));
            }
            for(let j = 0; j < leaving_units; j++)
            {
                const unit = new Unit(this.factions[faction], fort, point[0], point[1]);
                unit.targetFort = this.forts[target_fort];
                fort.leaving_units.push(unit);
            }
        }
        /*const traveling_units_count = data[i++];
        for(let j = 0; j < traveling_units_count; j++, i++)
        {
            const faction = data[i] >> 28;
            const x = data[i] >> 14 & ((1 << 14) - 1);
            const y = data[i] & ((1 << 14) - 1);
            i++;
            const render:boolean = (data[i] >> 30) !== 0;
            const target_fort_index:number = data[i] & ((1 << 30) - 1);
            const unit = new Unit(this.factions[faction], this.forts[target_fort_index], x, y);
            unit.currentFort = null;
            unit.targetFort = this.forts[target_fort_index];
            unit.render = render;
            this.traveling_units.push(unit);
        }*/
        const barrier_count = data[i++];
        for(let j = 0; j < barrier_count; j++, i++)
        {
            const faction = data[i] >> 28;
            const x = data[i] >> 14 & ((1 << 14) - 1);
            const y = data[i] & ((1 << 14) - 1);
            const point = this.normals_to_point([x, y]);
            this.barriers.push(new Barrier(this, this.factions[faction], point[0], point[1]));
        }
        
        for(let j = 0; j < this.factions.length; j++, i++)
        {
            const faction = this.factions[j];
            faction.unit_travel_speed = data[i] >> 16 & ((1 << 16) - 1);
            faction.fort_defense = data[i] >> 8 & ((1 << 8) - 1);
            faction.unit_defense = data[i] & ((1 << 8) - 1);
        }
    }
    width():number
    {
        return this.dimensions[2];
    }
    height():number
    {
        return this.dimensions[3];
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
        if(this.unused_barriers.length > 0)
        {
            const barrier = this.unused_barriers.pop()!;
            barrier.faction = faction;
            barrier.x = x - barrier.width / 2;
            barrier.y = y - barrier.height / 2;
            this.barriers.push(barrier);
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
        const faction_map = this.get_faction_index_map();
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
            const fort_index:number | undefined = fort_index_lookup.get(unit.targetFort);
            if(fort_index && records[fort_index])
            {
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
            if(faction_map.get(record.fort.faction)! > 1 + this.game.session.guests)
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
        if(this.traveling_units.length > 100)
        {
            if(delta_time > 20 && this.max_units_per_cell > 4)
            {
                this.max_units_per_cell--;
                console.log("sub", this.max_units_per_cell)
            }
            else if(delta_time < 12 && this.max_units_per_cell < 16)
            {
                this.max_units_per_cell++;
                console.log(this.max_units_per_cell)
            }

        }
        if(this.game.session.is_host)
            this.forts.forEach(fort => fort.update_state(delta_time));
        else
        {
            this.forts.forEach(fort => {
                if(fort.units.length === 0)
                {
                    fort.units.push(new Unit(fort.faction, fort, fort.x, fort.y));
                }
                fort.timed_send();
            });
        }
        for(let i = 0; i < this.traveling_units.length; i++)
        {
            const unit = this.traveling_units[i];
            if(!unit.update_state(delta_time))
            {
                this.traveling_units.splice(i, 1);
            }
        }
        const collision_checker = new FieldMap(this, this.traveling_units.length > this.max_traveling_units);
        collision_checker.handle_by_cell();
        if(this.game.session.is_host)
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

const menu_font_size = () => isTouchSupported() ? 27:22;
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
        this.increase_function = next;
        this.attribute_name = attribute_name;
        this.display_value = new GuiButton(callback, this.get_value() + "", pixelDim[0], menu_font_size() * 2 + 20, menu_font_size() + 2);
        this.display_name = new GuiTextBox(false, pixelDim[0], this.display_value, menu_font_size(), menu_font_size() * 2, GuiTextBox.default);
        
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
interface Move {
    game_id:number;
    faction_id:number;
    start_fort_id:number;
    end_fort_id:number;
};
class Session {
    id:number;
    local_game:Game;
    game_id:number;
    guests:number;//session ids for guests;
    is_host:boolean;
    error:boolean;
    constructor(game:Game, callback:(ses:Session) => void)
    {
        this.local_game = game;
        this.is_host = true;
        this.guests = 0;
        /*try{
        readFromServer("/register_session").then(data => {
            this.id = data.host_id;
            this.game_id = data.game_id;
            this.is_host = true;
            callback(this);
        });
        } catch(error:any)
        {
            this.error = true;
        }*/
    }
    registered():boolean
    {
        return this.id >= 0;
    }
    async re_register_session():Promise<boolean>
    {
        try{
            /*await readFromServer("/register_session").then(data => {
                this.id = data.host_id;
                this.game_id = data.game_id;
                this.is_host = true;
            });*/
            } catch(error:any)
            {
                this.error = true;
                return false;
            }
        return true;
    }
    async end_session():Promise<void>
    {
        /*
        await logToServer([this.id], "/unregister_session");
        */
        this.id = -1;
        this.game_id = -1;
        this.is_host = true;
    }
    async check_for_guests():Promise<boolean>
    {
        /*
        return await logToServer([this.game_id], "/has_guests");
        */
       return false;
    }
    async register_new_game_id():Promise<number>
    {
        /*const game = (await logToServer([this.id, this.game_id] , "/new_game"));
        this.game_id = game.game_id;
        this.is_host = true;*/
        return this.game_id;
    }
    async join_game(game_id:number):Promise<void>
    {
        const res = [0];//await logToServer([game_id, game_id !== this.game_id ? this.game_id : -1, this.id], "/register_guest");
        if(res[0])
        {
            const faction_id = res[0];
            this.local_game.currentField.player_faction_index = faction_id;
            this.game_id = game_id;
            this.is_host = faction_id === 1;
            this.local_game.currentField.update_state(10);
        }
        else
        {
            throw "error unable to register as guest too many units";
        }
    }
    async #join_random_game_r(tries:number = 0, max_tries:number = 50):Promise<boolean>
    {
        return false;
        if(!this.registered())
            this.re_register_session();
        const res = await logToServer([this.id, this.game_id], '/request_join_random_game');
        if(res)
        {
            const game_id:number = res[0];
            const faction_id:number = res[1];
            if(game_id && game_id !== -1)
            {
                this.game_id = game_id;
                this.is_host = faction_id === 1;
                this.local_game.currentField.player_faction_index = faction_id;
                this.local_game.currentField.update_state(10);
                return true;
            }
            else if(tries > max_tries)
            {
                return false;
            }
            else
            {
                await sleep(150);
                return await this.#join_random_game_r(tries + 1, max_tries);
            }
        }
        else
        {
            throw "Error could not connect to server";
        }
    }    
    async join_random_game():Promise<boolean>
    {
        return false;
        return await this.#join_random_game_r();
    }
    async post_game_state():Promise<any>
    {
        return false;
        const game = {state:this.local_game.currentField.encode_display_data_state(), game_id:this.game_id, host_id:this.id, guests:[]};
        return await logToServer(game, "/save_game_state");
    }
    post_moves(moves:Move[]):void
    {
        //logToServer(moves, "/register_moves");
    }
    async get_game_state():Promise<number[]>
    {
        return [0];
        return <number[]> (await logToServer([this.game_id], "/get_game_state")).state;
    }
    async get_and_apply_moves():Promise<void>
    {
        /*const moves = await logToServer([this.game_id], "/get_moves");
        for(let i = 0; i < moves.length; i++)
        {
            const move = moves[i];
            const start_fort = this.local_game.currentField.forts[move.start_fort_id];
            const end_fort = this.local_game.currentField.forts[move.end_fort_id];
            if(move.start_fort_id === move.end_fort_id)
            {
                start_fort.unsend_units();
            }
            else if(this.local_game.factions[move.faction_id] === start_fort.faction)
            {
                start_fort.send_units(end_fort);
            }
        }*/
    }
};
class Timed_Caller {
    callback:(dt:number) => void;
    last_call_time:number;
    cool_down:number;
    constructor(callback:(dt:number) => void, cool_down:number)
    {
        this.cool_down = cool_down;
        this.callback = callback;
        this.last_call_time = 0;
    }
    try_call():boolean
    {
        const delta_time = Date.now() - this.last_call_time;
        if(delta_time > this.cool_down)
        {
            this.callback(delta_time);
            this.last_call_time = Date.now();
            return true;
        }
        return false;
    }
};
class ServerSync {
    session:Session;
    update_server:Timed_Caller;
    pull_server_moves:Timed_Caller;
    pull_server_state:Timed_Caller;
    check_guests_count:Timed_Caller;
    constructor(session:Session)
    {
        this.session = session;
        this.update_server = new Timed_Caller((dt:number) => {
            this.session.post_game_state();
        }, 30);
        this.pull_server_moves = new Timed_Caller((dt:number) => {
            this.session.get_and_apply_moves();
        }, 10);
        this.pull_server_state = new Timed_Caller(async (dt:number) => {
            this.session.local_game.currentField.load_encoded_display_state(await this.session.get_game_state());
        }, 30);

        this.check_guests_count = new Timed_Caller(async (dt:number) => {
            const res = undefined;//(await logToServer([this.session.game_id], "/get_count_guests"))[0];
            this.session.guests = res ? res : 0;
        }, 250);
        window.onbeforeunload = () => {
            this.session.end_session();
        }
    }
    sync():void
    {
        if(this.session.registered())
        {
            this.check_guests_count.try_call();
            if(this.session.is_host)
            {
                this.update_server.try_call();
                this.pull_server_moves.try_call();
            }
            else
            {
                this.pull_server_state.try_call();
            }
        }
    }
};
class Game {
    session:Session;
    server_sync:ServerSync;
    currentField:BattleField;
    factions:Faction[];
    faction_base_speed:number;
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
    regular_control:boolean;
    main_controller:MainController;
    
    constructor(main_controller:MainController, canvas:HTMLCanvasElement, width:number, height:number)
    {
        this.main_controller = main_controller;
        this.session = new Session(this, async () => { console.log("Session established with server gameid:", this.session.game_id) });
        this.server_sync = new ServerSync(this.session);
        this.background = new ImageContainer("background", `./images/${"background"}.png`)
        this.dev_mode = false;
        this.joint_attack_mode = true;
        this.regular_control = true;
        this.difficulty = 0;
        this.wins = 0;
        this.losses = 0;
        this.factions = [];
        this.start_touch_forts = [];
        this.game_start = Date.now();
        this.mouse_down_tracker = new MouseDownTracker();
        this.faction_base_speed = Math.max(getWidth(), getHeight()) / 7.5;
        this.factions.push(new Faction("none", new RGB(125, 125, 125), 20, this.faction_base_speed));
        this.factions[0].attack = 2;
        this.factions[0].unit_reproduction_per_second = 1;
        this.game_over = true;
        srand(Math.random() * max_32_bit_signed);
        // seeds 607, 197 are pretty good so far lol
        for(let i = 0; i < 5; i++)
        {
            this.factions.push(new Faction("faction" + i, new RGB(random() * 128 + 128, random() * 128 + 128, random() * 128 + 128), 120, this.faction_base_speed, true));
        }
        this.factions[1].unit_reproduction_per_second += 0.3;
        this.currentField = new BattleField(this, [0, 0, width, height], this.factions, this.calc_fort_dim(width, height), Math.floor(Math.random() * 5) + 5);
        //this.factions[0].battleField = this.currentField;
        const is_player = (e:any) => this.currentField.find_nearest_fort(e.touchPos[0], e.touchPos[1]).faction === this.currentField.player_faction()
        this.keyboard_handler = new KeyboardHandler();
        this.touch_listener = new SingleTouchListener(canvas, true, true, false);
        this.touch_listener.registerCallBack("touchstart", (e:any) => !this.regular_control, (e:any) => {
            const point = new SquareAABBCollidable(e.touchPos[0], e.touchPos[1], 1, 1);
            let collision = false;
            for(let i = 0; i < this.currentField.barriers.length; i++)
            {
                const barrier = this.currentField.barriers[i];
                if(point.check_collision(barrier))
                {
                    this.currentField.unused_barriers.push(this.currentField.barriers.splice(i, 1)[0]);
                    collision = true;
                    break;
                }
            }
            if(!collision && !point.check_collision_gui(main_controller.control_state_toggle_group, 
                main_controller.control_state_toggle_group.x, main_controller.control_state_toggle_group.y))
            {
                this.currentField.place_barrier(this.currentField.player_faction(), e.touchPos[0], e.touchPos[1]);
            }
        });
        this.touch_listener.registerCallBack("touchstart", (e:any) => is_player(e) && this.regular_control, (event:any) => {
            this.start_touch_forts.splice(0, this.start_touch_forts.length);
            const nearest_fort = this.currentField.find_nearest_fort(event.touchPos[0], event.touchPos[1]);
            if(nearest_fort.faction === this.currentField.player_faction())
            {
                this.start_touch_forts.push(nearest_fort);
            }
        });
        const end_selection_possible = (e:any) => this.start_touch_forts.length !== 0;
        this.touch_listener.registerCallBack("touchmove", (e:any) => end_selection_possible(e) && this.joint_attack_mode && this.regular_control, (event:any) =>{
            const nearest_fort = this.currentField.find_nearest_fort(event.touchPos[0], event.touchPos[1]);
            this.end_touch_fort = nearest_fort;
            if(nearest_fort.faction === this.currentField.player_faction() && nearest_fort.check_collision(this.get_cursor()))
            {
                this.start_touch_forts.push(nearest_fort);
            }
        });
        this.touch_listener.registerCallBack("touchmove", (e:any) => end_selection_possible(e) && !this.joint_attack_mode && this.regular_control, (event:any) =>{
            const nearest_fort = this.currentField.find_nearest_fort(event.touchPos[0], event.touchPos[1]);
            this.end_touch_fort = nearest_fort;
        });
        this.touch_listener.registerCallBack("touchend", (e:any) => end_selection_possible(e) && this.regular_control, (event:any) => {
            this.end_touch_fort = this.currentField.find_nearest_fort(event.touchPos[0], event.touchPos[1]);
            if(this.end_touch_fort.check_collision(this.get_cursor()))
            {
                const moves:Move[] = [];
                for(let i = 0; i < this.start_touch_forts.length; i++)
                {
                    const start_fort = this.start_touch_forts[i];
                    moves.push({game_id:this.session.game_id, faction_id:this.currentField.player_faction_index, start_fort_id:this.currentField.forts.indexOf(start_fort), end_fort_id:this.currentField.forts.indexOf(this.end_touch_fort)});
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
                
                if(this.session.registered())
                {
                    if(!this.session.is_host)
                    {
                        this.session.post_moves(moves);
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
        window.addEventListener("load", () => setTimeout(() => this.currentField.draw(canvas, canvas.getContext("2d")!), 750));

        this.server_sync = new ServerSync(this.session);
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
    calc_fort_dim(width, height):number
    {
        return Math.max(width, height) / (isTouchSupported() ? 11 : 15);
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
        this.server_sync.sync();
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
    get_cursor():SquareAABBCollidable
    {
        const fort_dim = this.currentField.fort_dim;
        return new SquareAABBCollidable(this.touch_listener.touchPos[0] - fort_dim / 2, 
                        this.touch_listener.touchPos[1] - fort_dim / 2, 
                        fort_dim, fort_dim);
    }
    draw(dt:number, canvas:HTMLCanvasElement, ctx:CanvasRenderingContext2D):void
    {
        if(!this.game_over)
        {
            this.currentField.draw(canvas, ctx);
            if(this.regular_control)
            {
            if(this.mouse_down_tracker.mouseDown && this.start_touch_forts.length)
            {
                ctx.strokeStyle = new RGB(125, 125, 125, 125).htmlRBGA();
                ctx.lineWidth = 15;
                ctx.beginPath();
                const fort_dim = this.currentField.fort_dim;
                for(let i = 0; i < this.start_touch_forts.length; i++)
                {
                    const start_fort = this.start_touch_forts[i]!;
                    let end_fort = this.get_cursor();
                    if(this.end_touch_fort && this.end_touch_fort.check_collision(end_fort))
                    {
                        end_fort = this.end_touch_fort;
                    }
                    const odx = start_fort.mid_x() - end_fort.mid_x();
                    const ody = start_fort.mid_y() - end_fort.mid_y();
                    const dist = Math.sqrt(odx*odx + ody*ody);
                    const ndx = odx / dist;
                    const ndy = ody / dist;
                    let sx = start_fort.mid_x() - ndx * fort_dim;
                    let sy = start_fort.mid_y() - ndy * fort_dim;
                    if(Math.sqrt(odx*odx + ody*ody) <= fort_dim)
                    {
                        sx = start_fort.mid_x();
                        sy = start_fort.mid_y();
                    }
                    ctx.moveTo(sx, sy);
                    ctx.lineTo(end_fort.mid_x() + ndx * (fort_dim), end_fort.mid_y() + ndy * (fort_dim));
                    ctx.moveTo(end_fort.mid_x() + fort_dim, end_fort.mid_y());
                    ctx.arc(end_fort.mid_x(), end_fort.mid_y(), fort_dim, 0, 2 * Math.PI);
                }
                
                ctx.stroke();
                }
            }
            else
            {
                const barrier = this.currentField.barrier(this.currentField.player_faction(), this.touch_listener.touchPos[0], this.touch_listener.touchPos[1]);
                if(this.currentField.unused_barriers.length > 0 && barrier_sprite.image)
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
            if(this.session.is_host)
                ctx.drawImage(this.currentField.canvas, this.currentField.dimensions[0], this.currentField.dimensions[1]);
            else
            {
                this.currentField.update_state(dt);
                this.currentField.draw(canvas, ctx);
            }

            this.upgrade_menu.draw(ctx);
        }
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
        }
        return count;
    }
    players_fort_count():number
    {
        const start = 1;
        const end = start + this.session.guests;
        const faction_indeces = this.currentField.get_faction_index_map();
        let sum = 0;
        for(let i = 0; i < this.currentField.forts.length; i++)
        {
            const fort = this.currentField.forts[i];
            const faction_index = faction_indeces.get(fort.faction)!;
            if(faction_index >= start && faction_index <= end)
            {
                sum++;
            }
        }
        return sum;
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
    get_active_players():number[]
    {
        const faction_map = this.currentField.get_faction_index_map();
        const players:number[] = [];
        for(let i = 0; i < this.currentField.forts.length; i++)
        {
            const fort = this.currentField.forts[i];
            const faction_index = faction_map.get(fort.faction);
            if(faction_index && players.indexOf(faction_index) === -1 && faction_index > 0 && faction_index <= 1 + this.session.guests)
            {
                players.push(faction_index);
            }
        }
        return players;
    }
    is_game_over():boolean
    {
        const data = this.hp_by_faction();
        let sum = 0;
        for(let i = 2 + this.session.guests; i < data.length; i++)
        {
            sum += data[i];
        }
        const pfc = this.players_fort_count();
        const nfc = this.null_fort_count();
        const active_players:number[] = this.get_active_players();

        if(pfc === 0 && data[this.currentField.player_faction_index] === 0)
        {
            return true;
        }
        if(active_players.length === 1 && pfc + nfc === this.currentField.forts.length)
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
        const faction_id = this.currentField.player_faction_index
        this.currentField = new BattleField(this, this.currentField.dimensions, this.factions, this.currentField.fort_dim, Math.floor(Math.random() * 5) + 5);
        this.currentField.player_faction_index = faction_id;
    }
}
class MainMenu extends SimpleGridLayoutManager {

    //join game lbl, jg gameid tb, jg button
    //random join game button
    //single player button
    btn_join_specified_game:GuiButton;
    lbl_game_id:GuiButton;
    tb_game_id:GuiTextBox;
    btn_join_local_game:GuiButton;
    btn_join_random_game:GuiButton;
    constructor(controller:MainController, x:number, y:number, width:number, height:number)
    {
        super([2, 6], [width, height], x, y);
        this.btn_join_local_game = new GuiButton(() => {
            controller.game.session.end_session();
            this.deactivate();
        }, "Single Player", width, height / 3, menu_font_size());
        this.addElement(this.btn_join_local_game);
        this.btn_join_random_game = new GuiButton(() => {
            const join = async () => {
                if(!controller.game.session.registered())
                    await controller.game.session.re_register_session();
                const success = await controller.game.session.join_random_game()
                if(success) 
                {
                    controller.awaiting_guests = true;
                    this.deactivate();
                }
                else
                {
                    this.activate();
                    console.log("Could not find match");
                }
            }
            join();
        }, "Matchmaking", width / 2, height / 3, menu_font_size());

        this.addElement(this.btn_join_random_game);

        this.addElement(new GuiButton(() => {
            const join = async () => {
                if(!controller.game.session.registered())
                    await controller.game.session.re_register_session();
                const success = await controller.game.session.register_new_game_id();
                this.deactivate();
            }
            join();
        }, "Host Game", width / 2, height / 3, menu_font_size()));
        this.btn_join_specified_game = new GuiButton(() => {

            const game_id = this.tb_game_id.asNumber.get();

            const join = async () => {

                if(!controller.game.session.registered())
                    !controller.game.session.re_register_session();

                if(game_id)//set controller for status
                {
                    await controller.game.session.join_game(game_id);
                    this.deactivate();
                }
                else
                {
                    this.activate()
                }
            }
            join();
        }, "Join by game id", width / 2, height / 3, menu_font_size());
        this.tb_game_id = new GuiTextBox(true, width / 2, this.btn_join_specified_game, menu_font_size());
        this.lbl_game_id = new GuiButton(() => { }, "Game ID:", width / 2, height / 6, menu_font_size());
        const tb_group = new SimpleGridLayoutManager([1, 2], [width / 2, height / 3]);

        tb_group.addElement(this.lbl_game_id);
        tb_group.addElement(this.tb_game_id);
        this.addElement(tb_group);
        this.addElement(this.btn_join_specified_game);
    }
    activate():void
    {
        super.activate();
        this.elements.forEach(el => el.activate());
        this.tb_game_id.deactivate();
    }
};
class MainController {
    awaiting_guests:boolean;
    game:Game;
    main_menu:MainMenu;
    control_state_toggle_group:SimpleGridLayoutManager;
    button_toggle:GuiButton;
    button_pause:GuiButton;
    state:number;
    constructor(canvas:HTMLCanvasElement, width:number, height:number)
    {
        this.awaiting_guests = false;
        this.game = new Game(this, canvas, width, height);
        this.main_menu = new MainMenu(this, width / 4, height / 4, width / 2, height  * (isTouchSupported() ? 1/4 : 3/8));
        this.main_menu.createHandlers(this.game.keyboard_handler, this.game.touch_listener);
        this.main_menu.refresh();
        this.main_menu.activate();        
        this.control_state_toggle_group = new SimpleGridLayoutManager([2, 1], [this.game.currentField.fort_dim * 4, 40]);
        this.control_state_toggle_group.x = this.game.currentField.dimensions[2] - this.control_state_toggle_group.pixelDim[0];
        this.control_state_toggle_group.y = this.game.currentField.dimensions[3] - this.control_state_toggle_group.pixelDim[1] - 20;
        const b_state = "Place Barriers";
        const c_state = "Control Game"
        this.button_toggle = new GuiButton(() =>{}, c_state, this.control_state_toggle_group.pixelDim[0] / 2, this.control_state_toggle_group.pixelDim[1], 18);
        //this.control_state_toggle_group.pixelDim[1] = this.button_toggle.height();
        this.button_toggle.callback = () => {
            if(!this.game.regular_control){
                this.button_toggle.text = c_state;
                this.game.regular_control = true;
            }
            else
            {
                this.button_toggle.text = b_state;
                this.game.regular_control = false;
            }
        };
        this.control_state_toggle_group.addElement(this.button_toggle);
        this.control_state_toggle_group.addElement(new GuiButton(() => {
            this.game.upgrade_menu.deactivate(); 
            if(!this.main_menu.active())
                this.main_menu.activate();
            else
                this.main_menu.deactivate();
        }, "Pause", this.control_state_toggle_group.pixelDim[0] / 2, this.control_state_toggle_group.pixelDim[1], 18))
        this.control_state_toggle_group.createHandlers(this.game.keyboard_handler, this.game.touch_listener);
    }
    update_state(delta_time:number):void
    {
        if(this.main_menu.active())
        {
            this.main_menu.refresh();
        }
        else
        {
            this.game.update_state(delta_time);
        }
    }
    draw(dt:number, canvas:HTMLCanvasElement, ctx:CanvasRenderingContext2D):void
    {
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(this.game.currentField.dimensions[0], this.game.currentField.dimensions[1], this.game.currentField.dimensions[2], this.game.currentField.dimensions[3]);
        
        if(this.main_menu.active())
        {
            if(this.game.session.is_host)
                ctx.drawImage(this.game.currentField.canvas, this.game.currentField.dimensions[0], this.game.currentField.dimensions[1]);
            else
            {
                this.game.currentField.update_state(dt);
                this.game.currentField.draw(canvas, ctx);
            }
            this.main_menu.draw(ctx);
        }
        else
        {
            this.game.draw(dt, canvas, ctx);
        }

        if(this.game.session.registered())
        {
            ctx.font = `${18}px ${"Helvetica"}`;
            const game_info = `Session ID: ${this.game.session.id}, Game ID: ${this.game.session.game_id}, Faction ID: ${this.game.currentField.player_faction_index}. ${this.awaiting_guests ? `Awaiting guests. ${this.game.session.guests} joined` : `${this.game.session.guests} guests joined`}`;
            //ctx.measureText(game_info).width;
            ctx.fillText(game_info, 20, 20);
        }

        this.control_state_toggle_group.activate();
        this.control_state_toggle_group.draw(ctx);
    }
};
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
    //setInterval(() => logToServer(game_local.currentField.encode_display_data_state(), "/data"), 500)
    //setup rendering canvas, and view
    canvas.width = getWidth();
    canvas.height = getHeight();
    canvas.style.cursor = "pointer";
    let counter = 0;
    const touchScreen:boolean = isTouchSupported();
    let height = getHeight();
    let width = getWidth();
    const main_controller = new MainController(canvas, width, height);
    const game_local = main_controller.game;
    window.game = game_local;
    window.player_faction = game_local.currentField.player_faction();
    window.factions = window.game.factions;
    let start = Date.now();
    let dt = 1;
    const drawLoop = () => 
    {
        dt += Date.now() - start;
        start = Date.now();
        main_controller.update_state(dt);
        main_controller.draw(dt, canvas, ctx);
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
window.add_barriers = (count:number = 10) => {
    const field:BattleField = window.game.currentField;
    for(let i = 0; i < count; i++)
        field.unused_barriers.push(new Barrier(game.currentField, window.player_faction, 0, 0));
}

//toggle hard mode  //hard mode has ai upgrade 2x for every player upgrade
//toggle joint control mode