function sleep(ms:number):Promise<void> {
    return new Promise<void>((resolve:any) => setTimeout(resolve, ms));
}
function changeFavicon(src:string): void
{
    let link = document.createElement('link'),
        oldLink = document.getElementById('dynamic-favicon');
    link.id = 'dynamic-favicon';
    link.rel = 'shortcut icon';
    link.href = src;
    if (oldLink) {
     document.head.removeChild(oldLink);
    }
    document.head.appendChild(link);
}
/*fetchImage('/web/images/favicon.ico').then((value) =>
changeFavicon('/web/images/favicon.ico'));
fetchImage('images/favicon.ico').then((value) =>
changeFavicon('images/favicon.ico'));
*/
const dim = [128,128];

interface FilesHaver{
    files:FileList;
};
function threeByThreeMat(a:number[], b:number[]):number[]
{
    return [a[0]*b[0]+a[1]*b[3]+a[2]*b[6], 
    a[0]*b[1]+a[1]*b[4]+a[2]*b[7], 
    a[0]*b[2]+a[1]*b[5]+a[2]*b[8],
    a[3]*b[0]+a[4]*b[3]+a[5]*b[6], 
    a[3]*b[1]+a[4]*b[4]+a[5]*b[7], 
    a[3]*b[2]+a[4]*b[5]+a[5]*b[8],
    a[6]*b[0]+a[7]*b[3]+a[8]*b[6], 
    a[6]*b[1]+a[7]*b[4]+a[8]*b[7], 
    a[6]*b[2]+a[7]*b[5]+a[8]*b[8]];
}
function matByVec(mat:number[], vec:number[]):number[]
{
    return [mat[0]*vec[0]+mat[1]*vec[1]+mat[2]*vec[2],
            mat[3]*vec[0]+mat[4]*vec[1]+mat[5]*vec[2],
            mat[6]*vec[0]+mat[7]*vec[1]+mat[8]*vec[2]];
}
class Queue<T> {
    data:T[];
    start:number;
    end:number;
    length:number;
    constructor()
    {
        this.data = [];
        this.data.length = 64;
        this.start = 0;
        this.end = 0;
        this.length = 0;
    }
    push(val:T):void
    {
        if(this.length === this.data.length)
        {
            const newData:T[] = [];
            newData.length = this.data.length * 2;
            for(let i = 0; i < this.data.length; i++)
            {
                newData[i] = this.data[(i+this.start)%this.data.length];
            }
            this.start = 0;
            this.end = this.data.length;
            this.data = newData;
            this.data[this.end++] = val;
            this.length++;
        }
        else
        {
            this.data[this.end++] = val; 
            this.end &= this.data.length - 1;
            this.length++;
        }
    }
    pop():T
    {
        if(this.length)
        {
            const val = this.data[this.start];
            this.start++;
            this.start &= this.data.length - 1;
            this.length--;
            return val;
        }
        throw new Error("No more values in the queue");
    }
    get(index:number):T
    {
        if(index < this.length)
        {
            return this.data[(index+this.start)&(this.data.length-1)];
        }
		throw new Error(`Could not get value at index ${index}`);
    }
    set(index:number, obj:T):void
    {
        if(index < this.length)
        {
            this.data[(index+this.start) & (this.data.length - 1)] = obj;
        }
		throw new Error(`Could not set value at index ${index}`);
    }
};
class FixedSizeQueue<T> {
    data:T[];
    start:number;
    end:number;
    length:number;
    constructor(size:number)
    {
        this.data = [];
        this.data.length = size;
        this.start = 0;
        this.end = 0;
        this.length = 0;
    }
    push(val:T):void
    {
        if(this.length === this.data.length)
        {
            this.start++;
            this.data[this.end++] = val;
            this.start &= this.data.length - 1;
            this.end &= this.data.length - 1;
        }
        else
        {
            this.data[this.end++] = val; 
            this.end &= this.data.length - 1;
            this.length++;
        }
    }
    pop():T
    {
        if(this.length)
        {
            const val = this.data[this.start];
            this.start++;
            this.start &= this.data.length - 1;
            this.length--;
            return val;
        }
        throw new Error("No more values in the queue");
    }
    get(index:number):T
    {
        if(index < this.length)
        {
            return this.data[(index+this.start)&(this.data.length-1)];
        }
		throw new Error(`Could not get value at index ${index}`);
    }
    set(index:number, obj:T):void
    {
        if(index < this.length)
        {
            this.data[(index+this.start) & (this.data.length - 1)] = obj;
        }
		throw new Error(`Could not set value at index ${index}`);
    }
};
class RollingStack<T> {
    data:T[];
    start:number;
    end:number;
    size:number;
    reserve:number;
    constructor(size:number = 75)
    {
        this.data = [];
        this.start = 0;
        this.end = 0;
        this.reserve = size;
        this.size = 0;
        for(let i = 0; i < size; i++)
            this.data.push();
    }
    empty():void
    {
        this.start = 0;
        this.end = 0;
        this.size = 0;
    }
    length():number
    {
        return this.size;
    }
    pop():T | null
    {
        if(this.size)
        {
            this.size--;
            this.end--;
            if(this.end < 0)
                this.end = this.reserve - 1;
            return this.data[this.end];
        }
        return null;
    }
    push(val:T):void
    {
        if(this.size >= this.reserve)
        {
            this.start++;
            this.start %= this.reserve;
            this.size--;
        }
        this.size++;
        this.data[this.end++] = val;
        this.end %= this.reserve;
    }
    set(index:number, obj:T):void
    {
        this.data[(this.start + index) % this.reserve] = obj;
    }
    get(index:number):T
    {
        return this.data[(this.start + index) % this.reserve];
    }
};

function blendAlphaCopy(color0:RGB, color:RGB):void
{
    const alphant:number = color0.alphaNormal();
    const alphanc:number = color.alphaNormal();
    const a:number = (1 - alphanc);
    const a0:number = (alphanc + alphant * a);
    const a1:number = 1 / a0;
    color0.color = (((alphanc * color.red() + alphant * color0.red() * a) * a1)) |
        (((alphanc * color.green() + alphant * color0.green() * a) * a1) << 8) | 
        (((alphanc * color.blue() +  alphant * color0.blue() * a) * a1) << 16) |
        ((a0 * 255) << 24);
    /*this.setRed  ((alphanc*color.red() +   alphant*this.red() * a ) *a1);
    this.setBlue ((alphanc*color.blue() +  alphant*this.blue() * a) *a1);
    this.setGreen((alphanc*color.green() + alphant*this.green() * a)*a1);
    this.setAlpha(a0*255);*/
}
class RGB {
    color:number;
    constructor(r:number = 0, g:number = 0, b:number, a:number = 0)
    {
        this.color = 0;
        this.color = a << 24 | b << 16 | g << 8 | r;
    }
    blendAlphaCopy(color:RGB):void
    {
        blendAlphaCopy(this, color);
        /*this.setRed  ((alphanc*color.red() +   alphant*this.red() * a ) *a1);
        this.setBlue ((alphanc*color.blue() +  alphant*this.blue() * a) *a1);
        this.setGreen((alphanc*color.green() + alphant*this.green() * a)*a1);
        this.setAlpha(a0*255);*/
    }
    toHSL():number[]//[hue, saturation, lightness]
    {
        const normRed:number = this.red() / 255;
        const normGreen:number = this.green() / 255;
        const normBlue:number = this.blue() / 255;
        const cMax:number = Math.max(normBlue, normGreen, normRed);
        const cMin:number = Math.min(normBlue, normGreen, normRed);
        const delta:number = cMax - cMin;
        let hue:number = 0;
        if(delta !== 0)
        {
            if(cMax === normRed)
            {
                hue = 60 * ((normGreen - normBlue) / delta % 6);
            }
            else if(cMax === normGreen)
            {
                hue = 60 * ((normBlue - normRed) / delta + 2);
            }
            else
            {
                hue = 60 * ((normRed - normGreen) / delta + 4);
            }
        }
        const lightness:number = (cMax + cMin) / 2;
        const saturation:number = delta / (1 - Math.abs(2*lightness - 1));
        return [hue, saturation, lightness];
    }
    setByHSL(hue:number, saturation:number, lightness:number): void
    {
        const c:number = (1 - Math.abs(2 * lightness - 1)) * saturation;
        const x:number = c * (1 - Math.abs(hue / 60 % 2 - 1));
        const m:number = lightness - c / 2;
        if(hue < 60)
        {
            this.setRed((c + m) * 255);
            this.setGreen((x + m) * 255);
            this.setBlue(0);
        }
        else if(hue < 120)
        {
            this.setRed((x + m) * 255);
            this.setGreen((c + m) * 255);
            this.setBlue(m * 255);
        }
        else if(hue < 180)
        {
            this.setRed(m * 255);
            this.setGreen((c + m) * 255);
            this.setBlue((x + m) * 255);
        }
        else if(hue < 240)
        {
            this.setRed(0);
            this.setGreen((x + m) * 255);
            this.setBlue((c + m) * 255);
        }
        else if(hue < 300)
        {
            this.setRed((x + m) * 255);
            this.setGreen(m * 255);
            this.setBlue((c + m) * 255);
        }
        else
        {
            this.setRed((c + m) * 255);
            this.setGreen(m * 255);
            this.setBlue((x + m) * 255);
        }
        this.setAlpha(255);
    }
    compare(color:RGB):boolean
    {
        return color && this.color === color.color;
    }
    copy(color:RGB):void
    {
        this.color = color.color;
    }
    toInt():number
    {
        return this.color;
    }
    toRGBA():Array<number>
    {
        return [this.red(), this.green(), this.blue(), this.alpha()]
    }
    alpha():number
    {
        return (this.color >> 24) & ((1<<8)-1);
    }
    blue():number
    {
        return (this.color >> 16) & ((1 << 8) - 1);
    }
    green():number
    {
        return (this.color >> 8) & ((1 << 8) - 1);
    }
    red():number
    {
        return (this.color) & ((1 << 8) - 1);
    }
    alphaNormal():number
    {
        return Math.round((((this.color >> 24) & ((1<<8)-1)) / 255)*100)/100;
    }
    setAlpha(red:number)
    {
        this.color &= (1<<24)-1;
        this.color |= red << 24;
    }
    setBlue(green:number)
    {
        this.color &= ((1 << 16) - 1) | (((1<<8)-1) << 24);
        this.color |= green << 16;
    }
    setGreen(blue:number)
    {
        this.color &= ((1<<8)-1) | (((1<<16)-1) << 16);
        this.color |= blue << 8;
    }
    setRed(alpha:number)
    {
        this.color &=  (((1<<24)-1) << 8);
        this.color |= alpha;
    }
    loadString(color:string):number
    { 
        try {
            let r:number 
            let g:number 
            let b:number 
            let a:number 
            if(color.substring(0,4).toLowerCase() !== "rgba"){
                if(color[0] !== "#")
                    throw new Error("Exception malformed color: " + color);
                r = parseInt(color.substring(1,3), 16);
                g = parseInt(color.substring(3,5), 16);
                b = parseInt(color.substring(5,7), 16);
                a = parseFloat(color.substring(7,9))*255;
            }
            else
            {
                const vals = color.split(",");
                vals[0] = vals[0].split("(")[1];
                vals[3] = vals[3].split(")")[0];
                r = parseInt(vals[0], 10);
                g = parseInt(vals[1], 10);
                b = parseInt(vals[2], 10);
                a = parseFloat(vals[3])*255;
            }
            let invalid:number = 0;
            if(!isNaN(r) && r >= 0)
            {
                if(r > 255)
                {
                    this.setRed(255);
                    invalid = 2;
                }
                else
                    this.setRed(r);
            }
            else
                invalid = +(r > 0);
            if(!isNaN(g) && g >= 0)
            {
                if(g > 255)
                {
                    this.setGreen(255);
                    invalid = 2;
                }
                else
                    this.setGreen(g);
            }
            else
                invalid = +(g > 0);
            if(!isNaN(b) && b >= 0)
            {
                if(b > 255)
                {
                    this.setBlue(255);
                    invalid = 2;
                }
                else
                    this.setBlue(b);
            }
            else
                invalid = +(b > 0);
            if(!isNaN(a) && a >= 0)
            {
                if(a > 255)
                {
                    this.setAlpha(255);
                    invalid = 2;
                }
                else
                    this.setAlpha(a);
            }
            else
                invalid = +(a > 0);
            if(color[color.length - 1] !== ")")
                invalid = 1;
            let openingPresent:boolean = false;
            for(let i = 0; !openingPresent && i < color.length; i++)
            {
                openingPresent = color[i] === "(";
            }
            if(!openingPresent)
                invalid = 1;
            return invalid;
        } catch(error:any)
        {
            console.log(error);
            return 0;
        }
        
    }
    htmlRBGA():string{
        return `rgba(${this.red()}, ${this.green()}, ${this.blue()}, ${this.alphaNormal()})`
    }
    htmlRBG():string{
        const red:string = this.red() < 16?`0${this.red().toString(16)}`:this.red().toString(16);
        const green:string = this.green() < 16?`0${this.green().toString(16)}`:this.green().toString(16);
        const blue:string = this.blue() < 16?`0${this.blue().toString(16)}`:this.blue().toString(16);
        return `#${red}${green}${blue}`
    }
};

class Pair<T,U = T> {
    first:T;
    second:U;
    constructor(first:T, second:U)
    {
        this.first = first;
        this.second = second;
    }
};
class ImageContainer {
    image:HTMLImageElement | null;
    name:string;
    constructor(imageName:string, imagePath:string, callBack:((image:HTMLImageElement) => void) = (img) => console.log(imageName + " loaded."))
    {
        this.image = null;
        if(imagePath && imageName)
        fetchImage(imagePath).then(img => { 
            this.image = img;
            callBack(img);
        });
        this.name = imageName;
    }
};
interface GuiElement {
    active():boolean;
    deactivate():void;
    activate():void;
    width():number;
    height():number;
    refresh():void;
    draw(ctx:CanvasRenderingContext2D, x:number, y:number, offsetX:number, offsetY:number): void;
    handleKeyBoardEvents(type:string, e:any):void;
    handleTouchEvents(type:string, e:any):void;
    isLayoutManager():boolean;
};
class LexicoGraphicNumericPair extends Pair<number, number> {
    rollOver:number;
    constructor(rollOver:number)
    {
        super(0, 0);
        this.rollOver = rollOver;
    }
    incHigher(val:number = 1):number
    {
        this.first += val;
        return this.first;
    }
    incLower(val:number = 1):number
    {
        this.first += Math.floor((this.second + val) / this.rollOver);
        this.second = (this.second + val) % this.rollOver;
        return this.second;
    }
    hash():number
    {
        return this.first * this.rollOver + this.second;
    }
};
class RowRecord {
    x:number;
    y:number;
    width:number;
    height:number;
    element:GuiElement;
    constructor(x:number, y:number, width:number, height:number, element:GuiElement)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.element = element;
    }
}
class SimpleGridLayoutManager implements GuiElement {
    
    elements:GuiElement[];
    x:number;
    y:number;
    refreshRate:number;
    frameCounter:number;
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    matrixDim:number[];
    pixelDim:number[];
    elementsPositions:RowRecord[];
    focused:boolean;
    lastTouched:number;
    elementTouched:RowRecord | null;
    constructor(matrixDim:number[], pixelDim:number[], x:number = 0, y:number = 0)
    {
        this.lastTouched = 0;
        this.matrixDim = matrixDim;
        this.pixelDim = pixelDim;
        this.focused = false;
        this.x = x;
        this.y = y;
        this.refreshRate = 4;
        this.frameCounter = 0;
        this.elements = [];
        this.elementsPositions = [];
        this.canvas = document.createElement("canvas")!;
        this.canvas.width = pixelDim[0];
        this.canvas.height = pixelDim[1];
        this.ctx = this.canvas.getContext("2d")!;
        this.elementTouched = null;
    } 
    createHandlers(keyboardHandler:KeyboardHandler, touchHandler:SingleTouchListener):void
    {
        if(keyboardHandler)
        {
            keyboardHandler.registerCallBack("keydown", (e:any) => this.active(), 
            (e:any) => {e.keyboardHandler = keyboardHandler; this.elements.forEach(el => el.handleKeyBoardEvents("keydown", e))});
            keyboardHandler.registerCallBack("keyup", (e:any) => this.active(), 
            (e:any) => {e.keyboardHandler = keyboardHandler; this.elements.forEach(el => el.handleKeyBoardEvents("keyup", e))});
        }
        if(touchHandler)
        {
            touchHandler.registerCallBack("touchstart", (e:any) => this.active(), 
            (e:any) => {this.handleTouchEvents("touchstart", e)});
            touchHandler.registerCallBack("touchmove", (e:any) => this.active(), 
            (e:any) => {this.handleTouchEvents("touchmove", e)});
            touchHandler.registerCallBack("touchend", (e:any) => this.active(), 
            (e:any) => {this.handleTouchEvents("touchend", e)});
        }
    }  
    isLayoutManager():boolean {
        return true;
    } 
    handleKeyBoardEvents(type:string, e:any):void
    {
        this.elements.forEach(el => el.handleKeyBoardEvents(type, e));
        if(e.repaint)
        {
            this.refreshCanvas();
        }
    }
    handleTouchEvents(type:string, e:any):void
    {
        if(!this.elementTouched && e.touchPos[0] >= this.x && e.touchPos[0] < this.x + this.width() &&
            e.touchPos[1] >= this.y && e.touchPos[1] < this.y + this.height())
        {
            let record:RowRecord = <any> null;
            let index:number = 0;
            e.translateEvent(e,  -this.x, -this.y);
            let runningNumber:number = 0;
            this.elementsPositions.forEach(el => {
                    el.element.deactivate();
                    el.element.refresh();
                    if(e.touchPos[0] >= el.x && e.touchPos[0] < el.x + el.element.width() &&
                        e.touchPos[1] >= el.y && e.touchPos[1] < el.y + el.element.height())
                    {
                        record = el;
                        index = runningNumber;
                    }
                    runningNumber++;
            });
            e.translateEvent(e, this.x, this.y);
            if(record)
                {
                    e.preventDefault();
                    e.translateEvent(e, -record.x - this.x, -record.y - this.y);
                    if(type !== "touchmove")
                        record.element.activate();
                    record.element.handleTouchEvents(type, e);
                    e.translateEvent(e, record.x + this.x, record.y + this.y);
                    record.element.refresh();
                    this.elementTouched = record;
                    if(e.repaint)
                    {
                        this.refreshCanvas();
                    }
                    this.lastTouched = index;
            }
            
        }
        if(this.elementTouched)
        {
            e.preventDefault();
            if(type !== "touchmove")
                this.elementTouched.element.activate();
            e.translateEvent(e, -this.elementTouched.x , -this.elementTouched.y);
            this.elementTouched.element.handleTouchEvents(type, e);
            e.translateEvent(e, this.elementTouched.x , this.elementTouched.y);
            this.elementTouched.element.refresh();
            if(e.repaint)
            {
                this.refreshCanvas();
            }
        }
        if(type === "touchend")
            this.elementTouched = null;
    }
    refresh():void {
        this.refreshMetaData();
        this.refreshCanvas();
    }
    deactivate():void
    {
        this.focused = false;
        this.elements.forEach(el => {
            el.deactivate();
        });
    }
    activate():void
    {
        this.focused = true;
        this.elements.forEach(el => {
            el.activate();
        });
    }
    isCellFree(x:number, y:number):boolean
    {
        const pixelX:number = x * this.pixelDim[0] / this.matrixDim[0];
        const pixelY:number = y * this.pixelDim[1] / this.matrixDim[1];
        let free:boolean = true;
        if(pixelX < this.pixelDim[0] && pixelY < this.pixelDim[1])
        for(let i = 0; free && i < this.elementsPositions.length; i++)
        {
            const elPos:RowRecord = this.elementsPositions[i];
            if(elPos.x <= pixelX && elPos.x + elPos.width > pixelX &&
                elPos.y <= pixelY && elPos.y + elPos.height > pixelY)
                free = false;
        }
        else 
            free = false;
        return free;
    }
    refreshMetaData(xPos:number = 0, yPos:number = 0, offsetX:number = 0, offsetY:number = 0):void
    {
        this.elementsPositions.splice(0, this.elementsPositions.length);        
        const width:number = this.columnWidth();
        const height:number = this.rowHeight();
        let counter:LexicoGraphicNumericPair = new LexicoGraphicNumericPair(this.matrixDim[0]);
        let matX:number = 0;
        let matY:number = 0;
        for(let i = 0; i < this.elements.length; i++)
        {
            const element:GuiElement = this.elements[i];
            const elementWidth:number = Math.ceil(element.width() / this.columnWidth());
            let clearSpace:boolean = true;
            do {
                let j = counter.second;
                clearSpace = true;
                for(;clearSpace && j < counter.second + elementWidth; j++)
                {
                    clearSpace = this.isCellFree(j, counter.first);
                }
                if(!clearSpace && j < elementWidth)
                {
                    counter.incLower(j - counter.second);
                }
                else if(!clearSpace && j >= elementWidth)
                {
                    counter.incHigher();
                    counter.second = 0;
                }
            } while(!clearSpace && counter.first < this.matrixDim[1]);
            const x:number = counter.second * this.columnWidth();
            const y:number = counter.first * this.rowHeight();
            counter.second += elementWidth;
            if(element.isLayoutManager())
            {
                (<SimpleGridLayoutManager> element).x = x + this.x;
                (<SimpleGridLayoutManager> element).y = y + this.y;
            }
            const record:RowRecord = new RowRecord(x + xPos + offsetX, y + yPos + offsetY, element.width(), element.height(), element);
            this.elementsPositions.push(record);
        }
    }
    refreshCanvas(ctx:CanvasRenderingContext2D = this.ctx, x:number = 0, y:number = 0):void
    {
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.elementsPositions.forEach(el => 
            el.element.draw(ctx, el.x, el.y, x, y));
    }
    active():boolean
    {
        return this.focused;
    }
    width(): number {
        return this.pixelDim[0];
    }
    setWidth(val:number): void {
        this.pixelDim[0] = val;
        this.canvas.width = val;
    }
    height(): number {
        return this.pixelDim[1];
    }
    setHeight(val:number): void {
        this.pixelDim[1] = val;
        this.canvas.height = val;
    }
    rowHeight():number
    {
        return this.pixelDim[1] / this.matrixDim[1];
    }
    columnWidth():number
    {
        return this.pixelDim[0] / this.matrixDim[0];
    }
    usedRows():number {
        for(let i = 0; i < this.elements.length; i++)
        {
            
        }
        return this.elements.length - 1;
    }
    hasSpace(element:GuiElement):boolean
    {
        const elWidth:number = Math.floor((element.width() / this.columnWidth()) * this.matrixDim[0]);
        const elHeight:number = Math.floor((element.height() / this.rowHeight()) * this.matrixDim[1]);
        if(this.elements.length)
        {
            //todo
        }
        //todo
        return false;
    }
    addElement(element:GuiElement, position:number = -1):boolean //error state
    {
        let inserted:boolean = false;
        if(position === -1)
        {
            this.elements.push(element);
        }
        else
        {
            this.elements.splice(position, 0, element);
        }
        this.refreshMetaData();
        this.refreshCanvas();
        return inserted;
    }
    removeElement(element:GuiElement): void
    {
        this.elements.splice(this.elements.indexOf(element), 1);
        this.refreshMetaData();
        this.refreshCanvas();
    }
    elementPosition(element:GuiElement):number[]
    {
        const elPos:RowRecord | undefined = this.elementsPositions.find((el:RowRecord) => el.element === element);
        if(elPos === undefined)
            return [-1, -1];
        return [elPos.x, elPos.y];
    }
    draw(ctx:CanvasRenderingContext2D, xPos:number = this.x, yPos:number = this.y, offsetX:number = 0, offsetY:number = 0)
    {
        this.refreshCanvas();
        ctx.drawImage(this.canvas, xPos + offsetX, yPos + offsetY);
    }
};
class ScrollingGridLayoutManager extends SimpleGridLayoutManager {
    offset:number[];
    scrolledCanvas:HTMLCanvasElement;

    constructor(matrixDim:number[], pixelDim:number[], x:number = 0, y:number = 0)
    {
        super(matrixDim, pixelDim, x, y);
        this.scrolledCanvas = document.createElement("canvas");
        this.offset = [0, 0];
    }
    handleScrollEvent(event:any)
    {

    }
    refreshCanvas():void {
        super.refreshCanvas();
    }

};
class GuiListItem extends SimpleGridLayoutManager {
    textBox:GuiTextBox;
    checkBox:GuiCheckBox;
    slider:GuiSlider | null;
    sliderX:number | null;
    callBackType:string;
    callBack:((e:any) => void) | null;
    constructor(text:string, state:boolean, pixelDim:number[], fontSize:number = 16, callBack:((e:any) => void) | null = () => {}, genericCallBack:((e:any) => void) | null = null, slideMoved:((event:SlideEvent) => void) | null = null, flags:number = GuiTextBox.bottom, genericTouchType:string = "touchend")
    {
        super([20, 1], pixelDim);
        this.callBackType = genericTouchType;
        this.callBack = genericCallBack;
        this.checkBox = new GuiCheckBox(callBack, pixelDim[1], pixelDim[1], state);
        const width:number = (pixelDim[0] - fontSize * 2 - 10) >> (slideMoved ? 1: 0);
        this.textBox = new GuiTextBox(false, width, null, fontSize, pixelDim[1], flags);
        this.textBox.setText(text);
        this.addElement(this.checkBox);
        this.addElement(this.textBox);
        if(slideMoved)
        {
            this.slider = new GuiSlider(1, [width, pixelDim[1]], slideMoved);
            this.sliderX = width + pixelDim[1];
            this.addElement(this.slider);
        }
        else
        {
            this.slider = null;
            this.sliderX = -1;
        }
    }
    handleTouchEvents(type: string, e: any): void {
        super.handleTouchEvents(type, e);
        if(this.active() && type === this.callBackType)
        {
            e.item = this;
            if(this.callBack)
                this.callBack(e);
        }
    }
    state():boolean {
        return this.checkBox.checked;
    }
};
class SlideEvent {
    value:number;
    element:GuiSlider;
    constructor(value:number, element:GuiSlider)
    {
        this.value = value;
        this.element = element;
    }
}
class GuiCheckList implements GuiElement {
    limit:number;
    list:GuiListItem[];
    dragItem:GuiListItem | null;
    dragItemLocation:number[];
    dragItemInitialIndex:number;
    layoutManager:SimpleGridLayoutManager;
    fontSize:number;
    focused:boolean;
    uniqueSelection:boolean;
    swapElementsInParallelArray:((x1:number, x2:number) => void) | null;
    slideMoved:((event:SlideEvent) => void) | null;
    constructor(matrixDim:number[], pixelDim:number[], fontSize:number, uniqueSelection:boolean, swap:((x1:number, x2:number) => void) | null = null, slideMoved:((event:SlideEvent) => void) | null = null)
    {
        this.focused = true;
        this.uniqueSelection = uniqueSelection;
        this.fontSize = fontSize;
        this.layoutManager = new SimpleGridLayoutManager ([1,matrixDim[1]], pixelDim);
        this.list = [];
        this.limit = 0;
        this.dragItem = null;
        this.dragItemLocation = [-1, -1];
        this.dragItemInitialIndex = -1;
        this.slideMoved = slideMoved;
        this.swapElementsInParallelArray = swap;
    }
    push(text:string, state:boolean = true, checkBoxCallback:(event:any) => void, onClickGeneral:(event:any) => void): void
    {
        const newElement:GuiListItem = new GuiListItem(text, state, [this.width(),
            this.height() / this.layoutManager.matrixDim[1] - 5], this.fontSize, checkBoxCallback, onClickGeneral, this.slideMoved);
        this.list.push(newElement);
    }
    selected():number
    {
        return this.layoutManager.lastTouched;
    }
    selectedItem():GuiListItem | null
    {
        if(this.selected() !== -1)
            return this.list[this.selected()];
        else
            return null;
    }
    findBasedOnCheckbox(checkBox:GuiCheckBox):number
    {
        let index:number = 0;
        for(; index < this.list.length; index++)
        {
            if(this.list[index].checkBox === checkBox)
                break;
        }
        return index;
    }
    get(index:number):GuiListItem | null
    {
        if(this.list[index])
            return this.list[index];
        else
            return null;
    }
    isChecked(index:number):boolean
    {
        return this.list[index] ? this.list[index].checkBox.checked : false;
    }
    delete(index:number):void 
    {
        if(this.list[index])
        {
            this.list.splice(index, 1);
            this.refresh();
        }
    }
    active():boolean
    {
        return this.focused;
    }
    deactivate():void 
    {
        this.focused = false;
    }
    activate():void
    {
        this.focused = true;
    }
    width():number
    {
        return this.layoutManager.width();
    }
    height():number
    {
        return this.layoutManager.height();
    }
    refresh():void
    {
        this.layoutManager.elements = this.list;
        this.layoutManager.refresh();
    }
    draw(ctx:CanvasRenderingContext2D, x:number, y:number, offsetX:number, offsetY:number): void
    {
        //this.layoutManager.draw(ctx, x, y, offsetX, offsetY);
        const itemsPositions:RowRecord[] = this.layoutManager.elementsPositions;
        let offsetI:number = 0;
        for(let i = 0; i < itemsPositions.length; i++)
        {
            if(this.dragItem && this.dragItemLocation[1] !== -1 && i === Math.floor((this.dragItemLocation[1] / this.height()) * this.layoutManager.matrixDim[1]))
            {
                offsetI++;
            }
            this.list[i].draw(ctx, x, y + offsetI * (this.height() / this.layoutManager.matrixDim[1]), offsetX, offsetY);
            offsetI++;
        }
        if(this.dragItem)
            this.dragItem.draw(ctx, x + this.dragItemLocation[0] - this.dragItem.width() / 2, y + this.dragItemLocation[1] - this.dragItem.height() / 2, offsetX, offsetY);
    }
    handleKeyBoardEvents(type:string, e:any):void
    {
        this.layoutManager.handleKeyBoardEvents(type, e);
    }
    handleTouchEvents(type:string, e:any):void
    {
        let checkedIndex:number = -1;
        if(this.uniqueSelection)
        {
            for(let i = 0; i < this.list.length; i++) {
                if(this.list[i].checkBox.checked)
                {
                    checkedIndex = i;
                }
            };
            this.layoutManager.handleTouchEvents(type, e);
            for(let i = 0; i < this.list.length; i++)
            {
                if(this.list[i].checkBox.checked && i !== checkedIndex)
                {
                    this.list[checkedIndex].checkBox.checked = false;
                    this.list[checkedIndex].checkBox.refresh();
                    break;
                }     
            }
        }
        else {
            this.layoutManager.handleTouchEvents(type, e);
        }
        const clicked:number = Math.floor((e.touchPos[1] / this.height()) * this.layoutManager.matrixDim[1]);
        this.layoutManager.lastTouched = clicked > this.list.length ? this.list.length - 1 : clicked;
        switch(type)
        {
            case("touchend"):
            if(this.dragItem)
            {
                this.list.splice(clicked, 0, this.dragItem);
                if(this.swapElementsInParallelArray && this.dragItemInitialIndex !== -1)
                {
                    if(clicked > this.list.length)
                        this.swapElementsInParallelArray(this.dragItemInitialIndex, this.list.length - 1);
                    else
                    this.swapElementsInParallelArray(this.dragItemInitialIndex, clicked);
                }
                this.dragItem = null;
                this.dragItemInitialIndex = -1;
                this.dragItemLocation[0] = -1;
                this.dragItemLocation[1] = -1;
            }
            if(this.selectedItem() && this.selectedItem()!.callBack)
                this.selectedItem()!.callBack!(e);
            break;
            case("touchmove"):
            const movesNeeded:number = isTouchSupported()?7:2;
            if(this.selectedItem() && e.touchPos[0] < this.selectedItem()!.sliderX)
            {
                if(e.moveCount === movesNeeded && this.selectedItem() && this.list.length > 1)
                {
                    this.dragItem = this.list.splice(this.selected(), 1)[0];
                    this.dragItemInitialIndex = this.selected();
                    this.dragItemLocation[0] = e.touchPos[0];
                    this.dragItemLocation[1] = e.touchPos[1];
                }
                else if(e.moveCount > movesNeeded)
                {
                    this.dragItemLocation[0] += e.deltaX;
                    this.dragItemLocation[1] += e.deltaY;
                }
            }
            else if(e.moveCount > movesNeeded)
            {
                this.dragItemLocation[0] += e.deltaX;
                this.dragItemLocation[1] += e.deltaY;
            }
            break;
        }
    }
    isLayoutManager():boolean
    {
        return false;
    }
};
class GuiSlider implements GuiElement {
    state:number;//between 0.0, and 1.0
    focused:boolean;
    dim:number[];
    canvas:HTMLCanvasElement;
    callBack:((event:SlideEvent) => void) | null;
    constructor(state:number, dim:number[], movedCallBack:((event:SlideEvent) => void) | null){
        this.state = state;
        this.callBack = movedCallBack;
        this.focused = false;
        this.dim = [dim[0], dim[1]];
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width();
        this.canvas.height = this.height();
        this.refresh();
    }
    setState(value:number):void
    {
        if(value < 1  && value >= 0)
            this.state = value;
        else if(value >= 1)
            this.state = value;
        this.refresh();
    }
    active():boolean
    {
        return this.focused;
    }
    deactivate():void
    {
        this.focused = false;
    }
    activate():void
    {
        this.focused = true;
    }
    width():number
    {
        return this.dim[0];
    }
    height():number
    {
        return this.dim[1];
    }
    getBounds():number[]
    {
        return [this.width() / 10, this.height()/ 10, this.width() - this.width() / 5, this.height() - this.height() / 5];
    }
    refresh():void
    {
        const ctx:CanvasRenderingContext2D = this.canvas.getContext("2d")!;
        ctx.clearRect(0, 0, this.width(), this.height());
        ctx.fillStyle = "#FFFFFF";
        const bounds:number[] = this.getBounds();
        const center:number[] = [bounds[0] + bounds[2] / 2, bounds[1] + bounds[3] / 2];
        const displayLineX:number = this.state * bounds[2] + bounds[0];
        ctx.fillRect(bounds[0] - 1, center[1] - 1, bounds[2]+2, 4);
        ctx.fillRect(displayLineX - 1, bounds[1]-1, 5 + 1, bounds[3] + 2);
        ctx.fillStyle = "#000000";
        ctx.fillRect(bounds[0], center[1], bounds[2], 2);
        ctx.fillRect(displayLineX, bounds[1], 4, bounds[3]);
    }
    draw(ctx:CanvasRenderingContext2D, x:number, y:number, offsetX:number, offsetY:number):void
    {
        ctx.drawImage(this.canvas, x + offsetX, y + offsetY);
    }
    handleKeyBoardEvents(type:string, e:any):void
    {

    }
    handleTouchEvents(type:string, e:any):void
    {
        const bounds:number[] = [this.width() / 10, this.height()/ 10, this.width() - this.width() / 5, this.height() - this.height() / 5];
        switch(type)
        {
            case("touchstart"):
            this.state = (e.touchPos[0] - bounds[0]) / bounds[2];
            break;
            case("touchmove"):
            this.state = (e.touchPos[0] - bounds[0]) / bounds[2];
            break;
        }
        if(this.state > 1)
            this.state = 1;
        else if(this.state < 0)
            this.state = 0;
        if(this.callBack)
            this.callBack({value:this.state, element:this});
        this.refresh();
    }
    isLayoutManager():boolean
    {
        return false;
    }
};
class GuiSpacer implements GuiElement {
    dim:number[];
    constructor(dim:number[]){
        this.dim = [dim[0], dim[1]];
        this.refresh();
    }
    active():boolean
    {
        return false;
    }
    deactivate():void
    {}
    activate():void
    {}
    width():number
    {
        return this.dim[0];
    }
    height():number
    {
        return this.dim[1];
    }
    refresh():void
    {}
    draw(ctx:CanvasRenderingContext2D, x:number, y:number, offsetX:number, offsetY:number):void
    {}
    handleKeyBoardEvents(type:string, e:any):void
    {}
    handleTouchEvents(type:string, e:any):void
    {}
    isLayoutManager():boolean
    {
        return false;
    }
};
class GuiColoredSpacer implements GuiElement {
    dim:number[];
    color:RGB;
    constructor(dim:number[], color:RGB){
        this.dim = [dim[0], dim[1]];
        this.color = new RGB(0,0,0);
        this.color.copy(color);
        this.refresh();
    }
    active():boolean
    {
        return false;
    }
    deactivate():void
    {}
    activate():void
    {}
    width():number
    {
        return this.dim[0];
    }
    height():number
    {
        return this.dim[1];
    }
    refresh():void
    {}
    draw(ctx:CanvasRenderingContext2D, x:number, y:number, offsetX:number, offsetY:number):void
    {
        const originalFillStyle:string | CanvasPattern | CanvasGradient = ctx.fillStyle;
        const originalStrokeStyle:string | CanvasPattern | CanvasGradient = ctx.strokeStyle;
        const colorString:string = this.color.htmlRBGA();
        if(colorString !== originalFillStyle)
        {
            ctx.fillStyle = colorString;
        }
        if("#000000" !== originalStrokeStyle)
        {
            ctx.strokeStyle = "#000000";
        }
        ctx.fillRect(x + offsetX, y + offsetY, this.dim[0], this.dim[1]);
        ctx.strokeRect(x + offsetX, y + offsetY, this.dim[0], this.dim[1]);
        if(colorString !== originalFillStyle)
        {
            ctx.fillStyle = originalFillStyle;
        }
        if("#000000" !== originalStrokeStyle)
        {
            ctx.strokeStyle = originalStrokeStyle;
        }
    }
    handleKeyBoardEvents(type:string, e:any):void
    {}
    handleTouchEvents(type:string, e:any):void
    {}
    isLayoutManager():boolean
    {
        return false;
    }
};
class GuiButton implements GuiElement {

    text:string;
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    dimensions:number[];//[width, height]
    fontSize:number;
    pressedColor:RGB;
    unPressedColor:RGB;
    pressed:boolean;
    focused:boolean;
    font:FontFace;
    fontName:string
    callback:(() => void) | null;
    constructor(callBack:() => void | null, text:string, width:number = 200, height:number = 50, fontSize:number = 12, pressedColor:RGB = new RGB(150, 150, 200, 255), unPressedColor:RGB = new RGB(255, 255, 255, 195), fontName:string = "button_font")
    {
        this.text = text;
        this.fontSize = fontSize;
        this.dimensions = [width, height];
        this.canvas = document.createElement("canvas")!;
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d")!;
        this.pressedColor = pressedColor;
        this.unPressedColor = unPressedColor;
        this.pressed = false;
        this.focused = true;
        this.callback = callBack;
        this.fontName = fontName;
        //if(document.fonts.check(`16px ${this.fontName}`, "a"))
        {
            this.font = new FontFace(`${this.fontName}`, 'url(/web/fonts/Minecraft.ttf)');
            this.font.load().then((loaded_face) =>{
                document.fonts.add(loaded_face);
                this.drawInternal();
            }, (error:Error) => {
                this.font = new FontFace(`${this.fontName}`, 'url(/fonts/Minecraft.ttf)');
                this.font.load().then((loaded_face:any) => {
                        document.fonts.add(loaded_face);
                        this.drawInternal();
                    }, (error:Error) => {
                        console.log(error.message);
                        this.drawInternal();
                    });
            });
        }
    }
    handleKeyBoardEvents(type:string, e:any):void
    {
        if(this.active()){
            if(e.code === "Enter"){
                switch(type)
                {
                    case("keydown"):
                        this.pressed = true;
                        this.drawInternal();
                    break;
                    case("keyup"):
                    if(this.callback)
                        this.callback();
                        this.pressed = false;
                        this.drawInternal();
                        this.deactivate();
                    break;
                }
            }
        }
    }
    handleTouchEvents(type:string, e:any):void
    {
        if(this.active())
            switch(type)
            {
                case("touchstart"):
                    this.pressed = true;
                    this.drawInternal();
                break;
                case("touchend"):
                if(this.callback)
                    this.callback();
                    this.pressed = false;
                    this.drawInternal();
                break;
            }
            
    }
    isLayoutManager():boolean {
        return false;
    } 
    active():boolean
    {
        return this.focused;
    }
    deactivate():void
    {
        this.focused = false;
    }
    activate():void
    {
        this.focused = true;
    }
    width(): number {
        return this.dimensions[0];
    }
    height(): number {
        return this.dimensions[1];
    }
    setCtxState(ctx:CanvasRenderingContext2D):void
    {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        if(this.pressed)
            ctx.fillStyle = this.pressedColor.htmlRBGA();
        else
            ctx.fillStyle = this.unPressedColor.htmlRBGA();
        ctx.font = this.fontSize + `px ${this.fontName}`;
    }
    refresh(): void {
        this.drawInternal();
    }
    drawInternal(ctx:CanvasRenderingContext2D = this.ctx):void
    {
        const fs = ctx.fillStyle;
        this.setCtxState(ctx);
        ctx.fillRect(0, 0, this.width(), this.height());
        ctx.strokeRect(0, 0, this.width(), this.height());
        ctx.fillStyle = "#000000";
        const textWidth:number = ctx.measureText(this.text).width;
        const textHeight:number = this.fontSize;
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 4;
        ctx.strokeText(this.text, this.width() / 2 - textWidth / 2, this.height() / 2 + textHeight / 2, this.width());
        ctx.fillText(this.text, this.width() / 2 - textWidth / 2, this.height() / 2 + textHeight / 2, this.width());
        ctx.fillStyle = fs;
    } 
    draw(ctx:CanvasRenderingContext2D, x:number, y:number, offsetX:number = 0, offsetY:number = 0):void
    {
        ctx.drawImage(this.canvas, x + offsetX, y + offsetY);
    }
};
class GuiCheckBox implements GuiElement {

    checked:boolean;
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    dimensions:number[];//[width, height]
    fontSize:number;
    pressedColor:RGB;
    unPressedColor:RGB;
    pressed:boolean;
    focused:boolean;
    callback:((event:any) => void) | null;
    constructor(callBack:((event:any) => void) | null, width:number = 50, height:number = 50, checked:boolean = false, unPressedColor:RGB = new RGB(255, 255, 255, 0), pressedColor:RGB = new RGB(150, 150, 200, 255), fontSize:number = height - 10)
    {
        this.checked = checked;
        this.fontSize = fontSize;
        this.dimensions = [width, height];
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d")!;
        this.pressedColor = pressedColor;
        this.unPressedColor = unPressedColor;
        this.pressed = false;
        this.focused = true;
        this.callback = callBack;
        this.drawInternal();
    }
    handleKeyBoardEvents(type:string, e:any):void
    {
        if(this.active()){
            if(e.code === "Enter"){
                switch(type)
                {
                    case("keydown"):
                        this.pressed = true;
                        this.drawInternal();
                    break;
                    case("keyup"):
                        e.checkBox = this;
                        if(this.callback)
                            this.callback(e);
                        this.pressed = false;
                        this.drawInternal();
                        this.deactivate();
                    break;
                }
            }
        }
    }
    isLayoutManager():boolean {
        return false;
    } 
    handleTouchEvents(type:string, e:any):void
    {
        if(this.active())
            switch(type)
            {
                case("touchstart"):
                    this.pressed = true;
                    this.drawInternal();
                break;
                case("touchend"):
                    this.checked = !this.checked;
                    this.pressed = false;
                    e.checkBox = this;
                    if(this.callback)
                        this.callback(e);
                    this.drawInternal();
                break;
            }
            
    }
    active():boolean
    {
        return this.focused;
    }
    deactivate():void
    {
        this.focused = false;
    }
    activate():void
    {
        this.focused = true;
    }
    width(): number {
        return this.dimensions[0];
    }
    height(): number {
        return this.dimensions[1];
    }
    setCtxState(ctx:CanvasRenderingContext2D):void
    {
        if(this.pressed)
            ctx.fillStyle = this.pressedColor.htmlRBGA();
        else
            ctx.fillStyle = this.unPressedColor.htmlRBGA();
        ctx.font = this.fontSize + 'px Calibri';
    }
    refresh(): void {
        this.drawInternal();
    }
    drawInternal(ctx:CanvasRenderingContext2D = this.ctx):void
    {
        const fs = ctx.fillStyle;
        this.setCtxState(ctx);
        ctx.clearRect(0, 0, this.width(), this.height());
        ctx.fillRect(0, 0, this.width(), this.height());
        ctx.fillStyle = "#000000";
        ctx.strokeStyle = "#000000";
        ctx.strokeRect(1, 1, this.canvas.width - 2, this.canvas.height - 2);
        ctx.strokeStyle = "#FFFFFF";
        ctx.strokeRect(3, 3, this.canvas.width - 6, this.canvas.height - 6);
        ctx.fillText(this.checked?"\u2713":"", this.width()/2 - this.ctx.measureText("\u2713").width/2, 0 + this.fontSize, this.width());
        
        ctx.strokeText(this.checked?"\u2713":"", this.width()/2 - this.ctx.measureText("\u2713").width/2, 0 + this.fontSize, this.width());
        
        ctx.fillStyle = fs;
    } 
    draw(ctx:CanvasRenderingContext2D, x:number, y:number, offsetX:number = 0, offsetY:number = 0):void
    {
        ctx.drawImage(this.canvas, x + offsetX, y + offsetY);
    }
};
class TextRow { 
    text:string;
    x:number;
    y:number;
    width:number;
    constructor(text:string, x:number, y:number, width:number)
    {
        this.text = text;
        this.x = x;
        this.y = y;
        this.width = width;
    }
};
class Optional<T> {
    data:T | null;
    constructor() {
        this.data = null;
    }
    get():T | null
    {
        return this.data;
    } 
    set(data:T):void
    {
        this.data = data;
    }
    clear():void
    {
        this.data = null;
    }
};
interface TextBoxEvent {
    event:any;
    textbox:GuiTextBox;
    oldCursor:number;
    oldText:string;
};
class GuiTextBox implements GuiElement {
    text:string;
    asNumber:Optional<number>;
    rows:TextRow[];
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    cursor:number;
    scaledCursorPos:number[];
    cursorPos:number[];
    scroll:number[];
    focused:boolean;
    selectedColor:RGB;
    unSelectedColor:RGB;
    dimensions:number[];//[width, height]
    fontSize:number;
    static center:number = 0;
    static bottom:number = 1;
    static top:number = 2;
    static verticalAlignmentFlagsMask:number = 0b0011;
    static left:number = 0;
    static hcenter:number = (1 << 2);
    static right:number = (2 << 2);
    static farleft:number = (3 << 2);
    static horizontalAlignmentFlagsMask:number = 0b1100;
    static default:number =  GuiTextBox.center | GuiTextBox.left;

    static textLookup = {};
    static numbers = {};
    static specialChars = {};
    static textBoxRunningNumber:number = 0;
    textBoxId:number;
    flags:number;
    submissionButton:GuiButton | null;
    promptText:string;
    font:FontFace;
    fontName:string;
    handleKeyEvents:boolean;
    outlineTextBox:boolean;
    validationCallback:((tb:TextBoxEvent) => boolean) | null;
    constructor(keyListener:boolean, width:number, submit:GuiButton | null = null, fontSize:number = 16, height:number = 2*fontSize, flags:number = GuiTextBox.default,
        validationCallback:((event:TextBoxEvent) => boolean) | null = null, selectedColor:RGB = new RGB(80, 80, 220), unSelectedColor:RGB = new RGB(100, 100, 100), outline:boolean = true, fontName = "textBox_default", customFontFace:FontFace | null = null)
    {
        this.handleKeyEvents = keyListener;
        this.outlineTextBox = outline;
        this.validationCallback = validationCallback;
        GuiTextBox.textBoxRunningNumber++;
        this.textBoxId = GuiTextBox.textBoxRunningNumber;
        this.cursor = 0;
        this.flags = flags;
        this.focused = false;
        this.promptText = "";
        this.submissionButton = submit;
        this.selectedColor = selectedColor;
        this.unSelectedColor = unSelectedColor;
        this.asNumber = new Optional<number>();
        this.text = "";
        this.scroll = [0, 0];
        this.scaledCursorPos = [0, 0];
        this.cursorPos = [0, 0];
        this.rows = [];
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d")!;
        this.dimensions = [width, height];
        this.fontSize = fontSize;
        this.fontName = fontName;
        {
            if(customFontFace){
                this.font = customFontFace;
                this.font.family
            }
            else
                this.font = new FontFace(fontName, 'url(/web/fonts/Minecraft.ttf)');
            this.font.load().then((loaded_face) =>{
                document.fonts.add(loaded_face);
                this.drawInternalAndClear();
            }, (error:Error) => {
                this.font = new FontFace(fontName, 'url(/fonts/Minecraft.ttf)');
                this.font.load().then((loaded_face:any) => {
                        document.fonts.add(loaded_face);
                        this.refresh();
                    }, (error:Error) => {
                        console.log(error.message);
                        this.refresh();
                    });
            });
        }
    }
    //take scaled pos calc delta from cursor pos
    //
    isLayoutManager():boolean {
        return false;
    } 
    hflag():number {
        return this.flags & GuiTextBox.horizontalAlignmentFlagsMask;
    }
    hcenter():boolean {
        return this.hflag() === GuiTextBox.hcenter;
    }
    left():boolean {
        return this.hflag() === GuiTextBox.left;
    }
    farleft():boolean {
        return this.hflag() === GuiTextBox.farleft;
    }
    right():boolean {
        return this.hflag() === GuiTextBox.right;
    }
    center():boolean
    {
        return (this.flags & GuiTextBox.verticalAlignmentFlagsMask) === GuiTextBox.center;
    }
    top():boolean
    {
        return (this.flags & GuiTextBox.verticalAlignmentFlagsMask) === GuiTextBox.top;
    }
    bottom():boolean
    {
        return (this.flags & GuiTextBox.verticalAlignmentFlagsMask) === GuiTextBox.bottom;
    }
    handleKeyBoardEvents(type:string, e:any):void
    {
        let preventDefault:boolean = false;
        if(this.active() && this.handleKeyEvents) {
            preventDefault = true;
            const oldText:string = this.text;
            const oldCursor:number = this.cursor;
            switch(type)
            {
                case("keydown"):
                switch(e.code)
                {
                    case("NumpadEnter"):
                    case("Enter"):
                    this.deactivate();
                    if(this.submissionButton)
                    {
                        this.submissionButton.activate();
                        this.submissionButton.handleKeyBoardEvents(type, e);
                    }
                    break;
                    case("Space"):
                        this.text = this.text.substring(0, this.cursor) + ' ' + this.text.substring(this.cursor, this.text.length);
                        this.cursor++;
                    break;
                    case("Backspace"):
                        this.text = this.text.substring(0, this.cursor-1) + this.text.substring(this.cursor, this.text.length);
                        this.cursor -= +(this.cursor>0);
                    break;
                    case("Delete"):
                        this.text = this.text.substring(0, this.cursor) + this.text.substring(this.cursor+1, this.text.length);
                    break;
                    case("ArrowLeft"):
                        this.cursor -= +(this.cursor > 0);
                    break;
                    case("ArrowRight"):
                        this.cursor += +(this.cursor < this.text.length);
                    break;
                    case("ArrowUp"):
                        this.cursor = 0;
                    break;
                    case("ArrowDown"):
                        this.cursor = (this.text.length);
                    break;
                    case("Period"):
                    this.text = this.text.substring(0, this.cursor) + "." + this.text.substring(this.cursor, this.text.length);
                    this.cursor++;
                    break;
                    case("Comma"):
                    this.text = this.text.substring(0, this.cursor) + "," + this.text.substring(this.cursor, this.text.length);
                    this.cursor++;
                    break;
                    default:
                    {
                        let letter:string = e.code.substring(e.code.length - 1);
                        if(!e.keysHeld["ShiftRight"] && !e.keysHeld["ShiftLeft"])
                            letter = letter.toLowerCase();
                        if((<any> GuiTextBox.textLookup)[e.code] || (<any> GuiTextBox.numbers)[e.code])
                        {
                            this.text = this.text.substring(0, this.cursor) + letter + this.text.substring(this.cursor, this.text.length);
                            this.cursor++;
                        }
                        else if((<any> GuiTextBox.specialChars)[e.code])
                        {
                            //todo
                        }
                        else if(e.code.substring(0,"Numpad".length) === "Numpad")
                        {
                            this.text = this.text.substring(0, this.cursor) + letter + this.text.substring(this.cursor, this.text.length);
                            this.cursor++;
                        }

                    }
                }
                this.calcNumber();
                if(this.validationCallback)
                {
                    if(!this.validationCallback({textbox:this, event:e, oldCursor:oldCursor, oldText:oldText}))
                    {
                        this.text = oldText;
                        this.cursor = oldCursor;
                    }
                    else {
                        this.drawInternalAndClear();
                    }
                }
                else
                {
                    this.drawInternalAndClear();
                }
                    
            }
        }
        if(preventDefault)
            e.preventDefault();
    }
    setText(text:string):void
    {
        this.text = text;
        this.cursor = text.length;
        this.calcNumber();
        this.drawInternalAndClear();
    }
    calcNumber():void
    {
        if(!isNaN(Number(this.text)))
        {
            this.asNumber.set(Number(this.text))
        }
        else
            this.asNumber.clear();
    }
    handleTouchEvents(type:string, e:any):void
    {
        if(this.active()){
            switch(type)
            {
                case("touchend"):
                if(isTouchSupported() && this.handleKeyEvents)
                {
                    const value = prompt(this.promptText, this.text);
                    if(value)
                    {
                        this.setText(value);
                        this.calcNumber();
                        this.deactivate();
                        if(this.submissionButton)
                        {
                            this.submissionButton!.activate();
                            this.submissionButton!.callback!();
                        }
                    }
                }
                this.drawInternalAndClear();

            }
        }
    }
    static initGlobalText():void
    {
        for(let i = 65; i < 65+26; i++)
            (<any> GuiTextBox.textLookup)["Key" + String.fromCharCode(i)] = true;
    };
    static initGlobalNumbers():void
    {
        for(let i = 48; i < 48+10; i++){
            (<any> GuiTextBox.numbers)["Digit" + String.fromCharCode(i)] = true;
        }
    };
    static initGlobalSpecialChars():void
    {
        //specialChars
    }
    active():boolean
    {
        return this.focused;
    }
    deactivate():void
    {
        this.focused = false;
        this.refresh();
    }
    activate():void
    {
        this.focused = true;
        this.refresh();
    }
    textWidth():number
    {
        return this.ctx.measureText(this.text).width;
    }
    setCtxState():void
    {
        this.ctx.strokeStyle = "#000000";
        this.ctx.font = this.fontSize + `px ${this.fontName}`;
    }
    width(): number {
        return this.dimensions[0];
    }
    height(): number {
        return this.dimensions[1];
    }
    refreshMetaData(text:string = this.text, x:number = 0, y:number = this.fontSize, cursorOffset:number = 0): Pair<number, number[]>
    {
        if(text.search("\n") !== -1)
        {
            const rows:string[] = text.split("\n");
           let indeces:Pair<number, number[]> = new Pair(cursorOffset, [x, y]);
            rows.forEach(row => {
                indeces = this.refreshMetaData(row, indeces.second[0], indeces.second[1] + this.fontSize, indeces.first);
            });
            return indeces;
        }
        const textWidth:number = this.ctx.measureText(text).width;
        const canvasWidth:number = this.canvas.width;
        const rows:number = Math.ceil(textWidth / (canvasWidth - (20+x)));
        const charsPerRow:number = Math.floor(text.length / rows);
        const cursor:number = this.cursor - cursorOffset;
        let charIndex:number = 0;
        let i = 0;
        for(; i < rows - 1; i++)
        {
            const yPos:number = i * this.fontSize + y;
            if(cursor >= charIndex && cursor <= charIndex + charsPerRow)
            {
                this.cursorPos[1] = yPos;
                const substrWidth:number = this.ctx.measureText(text.substring(charIndex, cursor)).width;
                this.cursorPos[0] = substrWidth + x;
            }
            const substr:string = text.substring(charIndex, charIndex + charsPerRow);
            this.rows.push(new TextRow(substr, x, yPos, this.width() - x));
            charIndex += charsPerRow;
        }
        const yPos = i * this.fontSize + y;
        const substring:string = text.substring(charIndex, text.length);
        const substrWidth:number = this.ctx.measureText(substring).width;
        

        if(substrWidth > this.width() - x)
            this.refreshMetaData(substring, x, i * this.fontSize + y, cursorOffset + charIndex);
        else if(substring.length > 0){
            if(cursor >= charIndex)
            {
                this.cursorPos[1] = yPos;
                const substrWidth:number = this.ctx.measureText(text.substring(charIndex, cursor)).width
                this.cursorPos[0] = substrWidth + x;
            }
            this.rows.push(new TextRow(substring, x, yPos, this.width() - x));
        }
        return new Pair(cursorOffset + charIndex, [x, i * this.fontSize + y]);
    }
    cursorRowIndex():number
    {
        let index:number = 0;
        for(let i = 0; i < this.rows.length; i++)
        {
            const row:TextRow = this.rows[i];
            if(row.y === Math.floor(this.cursor / this.fontSize))
                index = i;
        }
        return index;
    }
    adjustScrollToCursor():TextRow[]
    {
        let deltaY:number = 0;
        let deltaX:number = 0;
        if(this.top())
        {   
            if(this.cursorPos[1] > this.height() - this.fontSize)
            {
                deltaY += this.cursorPos[1] - this.fontSize;
            }
            else if(this.cursorPos[1] < this.fontSize)
            {
                deltaY -= this.cursorPos[1] + this.fontSize;
            }
        } 
        else if(this.center())
        {
            if(this.cursorPos[1] > this.height()/2 + this.fontSize/2)
            {
                deltaY += this.cursorPos[1] - this.height() + this.height()/2;
            }
            else if(this.cursorPos[1] < this.height()/2 + this.fontSize/2)
            {
                deltaY += this.cursorPos[1] - (this.height()/2);
            }
        }
        else
        {
            if(this.cursorPos[1] > this.height() - 3)
            {
                deltaY += this.cursorPos[1] - this.height() + this.fontSize/3;
            }
            else if(this.cursorPos[1] < this.height() - 3)
            {

                deltaY += this.cursorPos[1] - this.height() + this.fontSize/3;
            }
        }
        if(this.rows.length)
        {
            let freeSpace:number = this.width();// - this.rows[0].width;
            let maxWidth:number = 0;
            this.rows.forEach(el => {
                const width:number = this.ctx.measureText(el.text).width;
                if(freeSpace > this.width() - width)
                {
                    freeSpace = this.width() - width;
                    maxWidth = width;
                }
            });
            if(this.hcenter())
            {
                deltaX -= freeSpace / 2 - maxWidth / 2;
            }
            else if(this.left())
            {
                deltaX -= this.ctx.measureText("0").width / 3;
            }
            else if(this.right())
            {
                deltaX -= freeSpace + this.ctx.measureText("0").width / 3;
            }
        }
        const newRows:TextRow[] = [];
        this.rows.forEach(row => newRows.push(new TextRow(row.text, row.x - deltaX, row.y - deltaY, row.width)));
        this.scaledCursorPos[1] = this.cursorPos[1] - deltaY;
        this.scaledCursorPos[0] = this.cursorPos[0] - deltaX;
        return newRows;
    }
    drawRows(rows:TextRow[]):void
    {
        rows.forEach(row => {
            this.ctx.lineWidth = 4;
            this.ctx.strokeText(row.text, row.x, row.y, row.width);
            this.ctx.fillText(row.text, row.x, row.y, row.width);
        });
    }
    drawCursor():void{
        if(this.active() && this.handleKeyEvents)
        {
            this.ctx.fillStyle = "#000000";
            this.ctx.fillRect(this.scaledCursorPos[0], this.scaledCursorPos[1] - this.fontSize+3, 2, this.fontSize-2);
        }
    }
    color():RGB
    {
        if(this.active())
            return this.selectedColor;
        else
            return this.unSelectedColor;
    }
    refresh(): void {
        this.drawInternalAndClear();
    }
    drawInternalAndClear():void
    {
        this.setCtxState();
        this.ctx.clearRect(0, 0, this.width(), this.height());
        this.ctx.fillStyle = "#000000";
        this.rows.splice(0,this.rows.length);
        this.refreshMetaData();
        this.ctx.strokeStyle = "#FFFFFF";
        this.drawRows(this.adjustScrollToCursor());
        this.drawCursor();
        if(this.outlineTextBox)
        {
            this.ctx.strokeStyle = this.color().htmlRBG();
            this.ctx.lineWidth = 4;
            this.ctx.strokeRect(0, 0, this.width(), this.height());
        }
    }
    draw(ctx:CanvasRenderingContext2D, x:number, y:number, offsetX:number = 0, offsetY:number = 0)
    {
        ctx.drawImage(this.canvas, x + offsetX, y + offsetY);
    }
};
class GuiLabel extends GuiTextBox {
    constructor(text:string, width:number, fontSize:number = 16, flags:number = GuiTextBox.bottom, height:number = 2*fontSize, 
        backgroundColor:RGB = new RGB(255, 255, 255, 0))
    {
        super(false, width, null, fontSize, height, flags, null, backgroundColor, backgroundColor, false);
        this.setText(text);
    }
    //override the textbox's handlers
    handleKeyBoardEvents(type:string, e:any):void {}
    handleTouchEvents(type:string, e:any):void {}
    active(): boolean {
        return false;
    }
};
class GuiRadioGroup implements GuiElement {
    layout:SimpleGridLayoutManager;
    constructor(pixelDim:number[], matrixDim:number[])
    {
        this.layout = new SimpleGridLayoutManager(matrixDim, pixelDim, 0, 0);
    }
    active():boolean
    {
        return this.layout.active();
    }
    deactivate():void
    {
        this.layout.deactivate();
    }
    activate():void
    {
        this.layout.activate();
    }
    width():number
    {
        return this.layout.width();
    }
    height():number
    {
        return this.layout.height();
    }
    refresh():void
    {
        this.layout.refresh()
    }
    draw(ctx:CanvasRenderingContext2D, x:number, y:number, offsetX:number, offsetY:number): void
    {
        this.layout.draw(ctx, x, y, offsetX, offsetY);
    }
    handleKeyBoardEvents(type:string, e:any):void
    {
        this.layout.handleKeyBoardEvents(type, e);
    }
    handleTouchEvents(type:string, e:any):void
    {
        this.layout.handleTouchEvents(type, e);
    }
    isLayoutManager():boolean
    {
        return false;
    }
}
GuiTextBox.initGlobalText();
GuiTextBox.initGlobalNumbers();
GuiTextBox.initGlobalSpecialChars();
class GuiToolBar implements GuiElement {
    tools:ToolBarItem[];
    focused:boolean;
    toolRenderDim:number[];
    toolsPerRow:number;//could also be per column depending on render settings
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    vertical:boolean
    selected:number;
    constructor(renderDim:number[], tools:Tool[] = []) {
        this.focused = false;
        this.selected = 0;
        this.vertical = true;
        this.toolsPerRow = 10;
        this.toolRenderDim = [renderDim[0], renderDim[1]];
        this.tools = tools;
        this.canvas = document.createElement("canvas");
        this.canvas.height = this.height();
        this.canvas.width = this.width();
        this.ctx = this.canvas.getContext("2d")!;
        this.ctx.strokeStyle = "#000000";
    }
    setImagesIndex(value:number):void
    {
        this.tools.forEach(tool => {
            if(tool.toolImages.length > value)
                tool.selected = value;
        });
    }
    resize(width:number = this.width(), height:number = this.height()):void
    {
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d")!;
        this.ctx.strokeStyle = "#000000";
    }
    active():boolean {
        return this.focused;
    }
    deactivate():void {
        this.focused = false;
    }
    activate():void {
        this.focused = true;
    }
    width():number {
        if(this.vertical)
            return this.toolRenderDim[0] * (1+Math.floor(this.tools.length / this.toolsPerRow));
        else
            return this.toolRenderDim[0] * this.toolsPerRow;
    }
    height():number {
        if(this.vertical)
            return this.toolRenderDim[1] * this.toolsPerRow;
        else
            return this.toolRenderDim[1] * (1+Math.floor(this.tools.length / this.toolsPerRow));
    }
    refresh():void {
        this.ctx.clearRect(0, 0, this.width(), this.height());
        for(let i = 0; i < this.tools.length; i++)
        {
            let gridX:number = 0;
            let gridY:number = 0;
            if(this.vertical)
            {
                const toolsPerColumn:number = this.toolsPerRow;
                gridX = Math.floor(i / toolsPerColumn);
                gridY = i % toolsPerColumn;
            }
            else
            {   
                gridX = i % this.toolsPerRow;
                gridY = Math.floor(i / this.toolsPerRow);
            }
            const pixelX:number = gridX * this.toolRenderDim[0];
            const pixelY:number = gridY * this.toolRenderDim[1];
            const image:HTMLImageElement | null = this.tools[i].image();
            if(image && image.width && image.height)
            {
                this.ctx.drawImage(image, pixelX, pixelY, this.toolRenderDim[0], this.toolRenderDim[1]);
            }
            if(this.selected === i)
            {
                this.ctx.strokeStyle = "#FFFFFF";
                this.ctx.strokeRect(pixelX + 3, pixelY + 3, this.toolRenderDim[0] - 6, this.toolRenderDim[1] - 6);
                this.ctx.strokeStyle = "#000000";
                this.ctx.strokeRect(pixelX + 1, pixelY + 1, this.toolRenderDim[0] - 2, this.toolRenderDim[1] - 2);
            }
        }
    }
    draw(ctx:CanvasRenderingContext2D, x:number, y:number, offsetX:number = 0, offsetY:number = 0) {
        ctx.drawImage(this.canvas, x + offsetX, y + offsetY);
    }
    handleKeyBoardEvents(type:string, e:any):void {}
    tool():ToolBarItem {
        return this.tools[this.selected];
    }
    handleTouchEvents(type:string, e:any):void {
        if(this.active())
        {
            switch(type){
                case("touchstart"):
                const x:number = Math.floor(e.touchPos[0] / this.toolRenderDim[0]);
                const y:number = Math.floor(e.touchPos[1] / this.toolRenderDim[1]);
                const clicked:number = this.vertical?y + x * this.toolsPerRow : x + y * this.toolsPerRow;
                if(clicked >= 0 && clicked < this.tools.length)
                {
                    this.selected = clicked;
                }
            }
            this.refresh();
        }
    }
    isLayoutManager():boolean {
        return false;
    }
};
interface RenderablePalette {
    getColorAt(x:number, y:number):RGB;
    refresh():void;
    draw(ctx:CanvasRenderingContext2D, x:number, y:number, width:number, height:number):void;
};
class RGB24BitPalette implements RenderablePalette {
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    colorData:Int32Array;
    constructor()
    {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d")!;
        this.colorData = <Int32Array> <any> null;
        this.refresh();
    }
    refresh():void 
    {

        this.colorData = new Int32Array(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data.buffer);
    }
    getColorAt(x:number, y:number):RGB 
    {
        return new RGB(0,0,0);
    }
    draw(ctx:CanvasRenderingContext2D, x:number, y:number, width:number, height:number):void
    {

    }
};
class ToolBarItem {
    toolImages:ImageContainer[];
    selected:number;
    constructor(toolName:string | string[], toolImagePath:string | string[], selected:number = 0)
    {
        this.selected = selected;
        this.toolImages = [];
        if(Array.isArray(toolName) && !(toolImagePath instanceof String) && toolName.length === toolImagePath.length)
        {
            for(let i = 0; i < toolName.length; i++)
                this.toolImages.push(new ImageContainer(toolName[i], toolImagePath[i]));
        }
        else if(!Array.isArray(toolName) && Array.isArray(toolImagePath))
        {
            for(let i = 0; i < toolName.length; i++)
                this.toolImages.push(new ImageContainer(toolName, toolImagePath[i]));
        }
        else if(Array.isArray(toolName) && Array.isArray(toolImagePath) && toolName.length !== toolImagePath.length)
            throw new Error("Invalid params for toolbar item both lists must be same length");
        else if(!Array.isArray(toolName) && !Array.isArray(toolImagePath))
        {
            this.toolImages.push(new ImageContainer(toolName, toolImagePath));
        }
        else if(!(toolName instanceof String) && (toolImagePath instanceof String))
        {
            throw new Error("Invalid params for toolbar item both params should be same type");
        }
    }
    imageContainer():ImageContainer {
        return this.toolImages[this.selected];
    }
    width():number
    {
        return this.imageContainer()!.image!.width;
    }
    height():number
    {
        return this.imageContainer()!.image!.height;
    }
    image():HTMLImageElement | null
    {
        if(this.imageContainer())
            return this.imageContainer()!.image!;
        return null
    }
    name():string
    {
        return this.imageContainer()!.name;
    }
    drawImage(ctx:CanvasRenderingContext2D, x:number, y:number, width:number, height:number)
    {
        if(this.image())
        {
            ctx.drawImage(this.image()!, x, y, width, height);
        }
    }
};
abstract class Tool extends ToolBarItem{
    constructor(toolName:string, toolImagePath:string[])
    {
        super(toolName, toolImagePath);
    }
    abstract optionPanelSize():number[];
    abstract activateOptionPanel():void;
    abstract deactivateOptionPanel():void;
    abstract getOptionPanel():SimpleGridLayoutManager | null;
    abstract drawOptionPanel(ctx:CanvasRenderingContext2D, x:number, y:number):void;

};
class ViewLayoutTool extends Tool {
    layoutManager:SimpleGridLayoutManager;
    constructor(layoutManager:SimpleGridLayoutManager, name:string, path:string[])
    {
        super(name, path);
        this.layoutManager = layoutManager;
    }

    activateOptionPanel():void { this.layoutManager.activate(); }
    deactivateOptionPanel():void { this.layoutManager.deactivate(); }
    getOptionPanel():SimpleGridLayoutManager | null {
        return this.layoutManager;
    }
    optionPanelSize():number[]
    {
        return [this.layoutManager.canvas.width, this.layoutManager.canvas.height];
    }
    drawOptionPanel(ctx:CanvasRenderingContext2D, x:number, y:number):void
    {
        const optionPanel:SimpleGridLayoutManager = this.getOptionPanel()!;
        optionPanel.x = x;
        optionPanel.y = y;
        optionPanel.draw(ctx, x, y);
    }
};
class GenericTool extends Tool {
    constructor(name:string, imagePath:string[])
    {
        super(name, imagePath);
    }
    activateOptionPanel():void {}
    deactivateOptionPanel():void {}
    getOptionPanel():SimpleGridLayoutManager | null {
        return null;
    }
    optionPanelSize():number[]
    {
        return [0, 0];
    }
    drawOptionPanel(ctx:CanvasRenderingContext2D, x:number, y:number):void {}
};
class ExtendedTool extends ViewLayoutTool {
    localLayout:SimpleGridLayoutManager;
    optionPanels:SimpleGridLayoutManager[];
    constructor(name:string, path:string[], optionPanes:SimpleGridLayoutManager[], dim:number[], matrixDim:number[] = [24, 24], parentMatrixDim:number[] = [24, 48])
    {
        super(new SimpleGridLayoutManager([parentMatrixDim[0],parentMatrixDim[1]], [dim[0], dim[1]]), name, path);
        this.localLayout = new SimpleGridLayoutManager([matrixDim[0],matrixDim[1]], [dim[0], dim[1]]);
        const parentPanel:SimpleGridLayoutManager = this.getOptionPanel()!;
        parentPanel.addElement(this.localLayout);
        this.optionPanels = [this.localLayout];
        let maxY:number = this.localLayout.height();
        let maxX:number = this.localLayout.width();
        optionPanes.forEach((pane:any) => {
            parentPanel.addElement(pane);
            this.optionPanels.push(pane);
            maxY += pane.height();
        });
        parentPanel.setHeight(maxY);
        parentPanel.setWidth(maxX);
        parentPanel.refreshMetaData();
        maxY = 0;
        parentPanel.elementsPositions.forEach(el => {
            if(el.y + el.height > maxY)
            {
                maxY = el.y + el.height;
            }
        });
        parentPanel.setWidth(maxX);
        parentPanel.setHeight(dim[1] + maxY);
        parentPanel.refreshMetaData();

    }
    activateOptionPanel(): void {
        this.getOptionPanel()!.activate();
        this.optionPanels.forEach(element => {
            element.activate();
        });
    }
    deactivateOptionPanel(): void {
        this.getOptionPanel()!.deactivate();
        this.optionPanels.forEach(element => {
            element.deactivate();
        });
    }
};
class SingleCheckBoxTool extends GenericTool {
    optionPanel:SimpleGridLayoutManager;
    checkBox:GuiCheckBox;
    constructor(label:string, name:string, imagePath:string[], callback:() => void = () => null)
    {
        super(name, imagePath);
        this.optionPanel = new SimpleGridLayoutManager([1,4], [200, 90]);
        this.checkBox = new GuiCheckBox(callback, 40, 40);
        this.optionPanel.addElement(new GuiLabel(label, 200, 16, GuiTextBox.bottom, 40));
        this.optionPanel.addElement(this.checkBox);
    }
    activateOptionPanel():void { this.optionPanel.activate(); }
    deactivateOptionPanel():void { this.optionPanel.deactivate(); }
    getOptionPanel():SimpleGridLayoutManager | null {
        return this.optionPanel;
    }
    optionPanelSize():number[]
    {
        return [this.optionPanel.width(), this.optionPanel.height()];
    }
    drawOptionPanel(ctx:CanvasRenderingContext2D, x:number, y:number):void {
        const optionPanel:SimpleGridLayoutManager = this.getOptionPanel()!;
        optionPanel.x = x;
        optionPanel.y = y;
        optionPanel.draw(ctx, x, y);
    }
};


class DrawingScreenState {
    color:RGB;
    lineWidth:number;
    drawCircular:boolean;
    dragOnlyOneColor:boolean;
    rotateOnlyOneColor:boolean;
    blendAlphaOnPaste:boolean;
    blendAlphaOnPutSelectedPixels:boolean;
    antiAliasRotation:boolean;
    sprayProbability:number;
    slow:boolean;
    resizeSprite:boolean;
    bufferBitMask:boolean[];
    allowDropOutsideSelection:boolean;
    selectionRect:number[];
    pasteRect:number[];
    selectionSelectionRect:number[];
    pixelPerfectBuffer:number[];
    drawCacheMap:Set<number>;

    constructor(lineWidth:number) {
        this.drawCacheMap = new Set<number>();
        this.color = new RGB(0,0,0);
        this.allowDropOutsideSelection = false;
        this.bufferBitMask = [];
        this.sprayProbability = 1;
        this.antiAliasRotation = true;
        this.blendAlphaOnPutSelectedPixels = true;
        this.dragOnlyOneColor = false;
        this.rotateOnlyOneColor = false;
        this.drawCircular = true;
        this.slow = false;
        this.blendAlphaOnPaste = true;
        this.resizeSprite = false;
        this.selectionRect = [0,0,0,0];
        this.pasteRect = [0,0,0,0];
        this.selectionSelectionRect = [0,0,0,0];
        this.lineWidth = lineWidth;//dimensions[0] / bounds[0] * 4;
        this.pixelPerfectBuffer = [];
    }
};
class DetailedPixelsGroup {
    x:number;
    y:number;
    colors:number[];
    topLeftPoints:number[];
    bottomLeftPoints:number[];
    topRightPoints:number[];
    bottomRightPoints:number[];

    constructor()
    {
        this.x = 0;
        this.y = 0;
        this.colors = [];
        this.topLeftPoints = [];
        this.bottomLeftPoints = [];
        this.topRightPoints = [];
        this.bottomRightPoints = [];
    }
    push(color:number, topLeftX:number, topLeftY:number, bottomLeftX:number, bottomLeftY:number, topRightX:number, topRightY:number, bottomRightX:number, bottomRightY:number): void {
        this.colors.push(color);
        this.topLeftPoints.push(topLeftX);
        this.topLeftPoints.push(topLeftY);
        this.topRightPoints.push(topRightX);
        this.topRightPoints.push(topRightY);
        this.bottomLeftPoints.push(bottomLeftX);
        this.bottomLeftPoints.push(bottomLeftY);
        this.bottomRightPoints.push(bottomRightX);
        this.bottomRightPoints.push(bottomRightY);
    }
    pushSimple(color:number, topLeftX:number, topLeftY:number, bottomLeftX:number): void
    {
        this.colors.push(color);
        this.topLeftPoints.push(topLeftX);
        this.topLeftPoints.push(topLeftY);
    }
    clearLists(): void
    {
        this.colors = [];
        this.topLeftPoints = [];
        this.bottomLeftPoints = [];
        this.topRightPoints = [];
        this.bottomRightPoints = [];
    }
    resetState(): void
    {
        this.x = -1;
        this.y = -1;
        this.clearLists();
    }
}
class ZoomState {
    zoomX:number; // 0 to 1;
    zoomY:number;
    zoomedX:number;
    zoomedY:number;
    offsetX:number;
    offsetY:number;
    miniMapRect:number[];

    constructor() {
        this.zoomX = 1;
        this.zoomY = 1;
        this.miniMapRect = [0, 0, 150, 150];
        this.zoomedX = 0;
        this.zoomedY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }
    invZoomX(x:number)
    {
        return (1 / (this.zoomX)) * (x - this.zoomedX);
    }
    invZoomY(y:number)
    {
        return (1 / (this.zoomY )) * (y - this.zoomedY);
    }
    invJustZoomX(x:number)
    {
        return (1 / (this.zoomX)) * (x);
    }
    invJustZoomY(y:number)
    {
        return (1 / (this.zoomY)) * (y);
    }
};
interface MessageData {
    start:number;
    end:number;
    height:number;
    width:number;
    polygon:number[][];
    poolIndex:number;
};
class KeyListenerTypes {
    keydown:Array<TouchHandler>;
    keypressed:Array<TouchHandler>;
    keyup:Array<TouchHandler>;
    constructor()
    {
        this.keydown = new Array<TouchHandler>();
        this.keypressed = new Array<TouchHandler>();
        this.keyup = new Array<TouchHandler>();
    }
};
class KeyboardHandler {
    keysHeld:any;
    listenerTypeMap:KeyListenerTypes;
    constructor()
    {
        this.keysHeld = {};
        this.listenerTypeMap = new KeyListenerTypes();
        document.addEventListener("keyup", (e:any) => this.keyUp(e));
        document.addEventListener("keydown", (e:any) => this.keyDown(e));
        document.addEventListener("keypressed", (e:any) => this.keyPressed(e));
    }
    registerCallBack(listenerType:string, predicate:(event:any) => boolean, callBack:(event:any) => void):void
    {
        (<any> this.listenerTypeMap)[listenerType].push(new TouchHandler(predicate, callBack));
    }
    callHandler(type:string, event:any):void
    {
        const handlers:TouchHandler[] = (<any> this.listenerTypeMap)[type];
        handlers.forEach((handler:TouchHandler) => {
            if(handler.pred(event))
            {
                handler.callBack(event);
            }
        });
    }
    keyDown(event:any)
    {
        if(this.keysHeld[event.code] === undefined || this.keysHeld[event.code] === null)
            this.keysHeld[event.code] = 1;
        else
            this.keysHeld[event.code]++;
        event.keysHeld = this.keysHeld;
        this.callHandler("keydown", event);
    }
    keyUp(event:any)
    {
        this.keysHeld[event.code] = 0;
        event.keysHeld = this.keysHeld;
        this.callHandler("keyup", event);
    }
    keyPressed(event:any)
    {
        event.keysHeld = this.keysHeld;
        this.callHandler("keypressed", event);
    }
    
};
class TouchHandler {
    pred:(event:any) => boolean; 
    callBack:(event:any) => void;
    constructor(pred:(event:any) => boolean, callBack:(event:any) => void)
    {
        this.pred = pred;
        this.callBack = callBack;
    }
};
class ListenerTypes {
    touchstart:Array<TouchHandler>;
    touchmove:Array<TouchHandler>;
    touchend:Array<TouchHandler>;
    constructor()
    {
        this.touchstart = new Array<TouchHandler>();
        this.touchmove = new Array<TouchHandler>();
        this.touchend = new Array<TouchHandler>();
    }
};
interface TouchMoveEvent {

    deltaX:number;
    deltaY:number;
    mag:number;
    angle:number;
    avgVelocity:number;
    touchPos:number[];
    startTouchTime:number;
    eventTime:number;
    moveCount:number;

};
function isTouchSupported():boolean {
    return (('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0));
}
class MouseDownTracker {
    mouseDown:boolean;
    count:number | null;
    constructor()
    {
        const component = document;
        this.mouseDown = false;
        this.count = null;
        if(isTouchSupported())
        {
            this.count = 0;
            component.addEventListener('touchstart', event => { this.mouseDown = true; this.count!++; }, false);
            component.addEventListener('touchend', event => { this.mouseDown = false; this.count!--; }, false);
        }
        if(!isTouchSupported()){
            component.addEventListener('mousedown', event => this.mouseDown = true );
            component.addEventListener('mouseup', event => this.mouseDown = false );
    
        }
    }
    getTouchCount(): number
    { return this.count!; }
}
class SingleTouchListener
{
    lastTouchTime:number;
    moveCount:number;
    preventDefault:any;
    touchStart:any;
    registeredTouch:boolean;
    static mouseDown:MouseDownTracker = new MouseDownTracker();
    touchPos:Array<number>;
    startTouchPos:number[];
    offset:Array<number>;
    touchVelocity:number;
    touchMoveCount:number;
    deltaTouchPos:number;
    listenerTypeMap:ListenerTypes;
    component:HTMLElement;
    touchMoveEvents:TouchMoveEvent[];
    mouseOverElement:boolean;
    translateEvent:(event:any, dx:number, dy:number) => void;
    scaleEvent:(event:any, dx:number, dy:number) => void;
    constructor(component:HTMLElement | null, preventDefault:boolean, mouseEmulation:boolean, stopRightClick:boolean = false)
    {
        this.lastTouchTime = Date.now();
        this.offset = [];
        this.moveCount = 0;
        this.touchMoveEvents = [];
        this.translateEvent = (e:any, dx:number, dy:number) => e.touchPos = [e.touchPos[0] + dx, e.touchPos[1] + dy];
        this.scaleEvent = (e:any, dx:number, dy:number) => e.touchPos = [e.touchPos[0] * dx, e.touchPos[1] * dy];
        this.startTouchPos = [0, 0];
        this.component = component!;
        this.preventDefault = preventDefault;
        this.touchStart = null;
        this.registeredTouch = false;
        this.touchPos = [0,0];
        this.touchVelocity = 0;
        this.touchMoveCount = 0;
        this.deltaTouchPos = 0;
        this.listenerTypeMap = {
            touchstart:[],
            touchmove:[],
            touchend:[]
        };
        this.mouseOverElement = false;
        if(component)
        {
            if(isTouchSupported())
            {
                component.addEventListener('touchstart', (event:any) => {this.touchStartHandler(event);}, false);
                component.addEventListener('touchmove', (event:any) => this.touchMoveHandler(event), false);
                component.addEventListener('touchend', (event:any) => this.touchEndHandler(event), false);
            }
            if(mouseEmulation && !isTouchSupported()){
                if(stopRightClick)
                    component.addEventListener("contextmenu", (e:any) => {
                        e.preventDefault();
                        return false;
                    });
                component.addEventListener("mouseover", (event:any) => { this.mouseOverElement = true;});
                component.addEventListener("mouseleave", (event:any) => { this.mouseOverElement = false;});
                component.addEventListener('mousedown', (event:any) => {(<any>event).changedTouches = {};(<any>event).changedTouches.item = (x:any) => event; this.touchStartHandler(event)});
                component.addEventListener('mousemove', (event:any) => {
                    (<any>event).changedTouches = {};(<any>event).changedTouches.item = (x:any) => event; this.touchMoveHandler(event)
                });
                component.addEventListener('mouseup', (event:any) => {(<any>event).changedTouches = {};(<any>event).changedTouches.item = (x:any) => event; this.touchEndHandler(event)});
        
            }
        }
    }
    registerCallBack(listenerType:string, predicate:(event:any) => boolean, callBack:(event:any) => void):void
    {
        (<any> this.listenerTypeMap)[listenerType].push(new TouchHandler(predicate, callBack));
    }
    callHandler(type:string, event:any):void
    {
        const handlers:TouchHandler[] = (<any> this.listenerTypeMap)[type];
        const touchSupported:boolean = isTouchSupported();
        if(SingleTouchListener.mouseDown.getTouchCount() < 2)
        handlers.forEach((handler:TouchHandler) => {
            if((!event.defaultPrevented || touchSupported) && handler.pred(event))
            {
                handler.callBack(event);
            }
        });
        
    }
    touchStartHandler(event:any):void
    {
        this.registeredTouch = true;
        this.moveCount = 0;
        event.timeSinceLastTouch = Date.now() - (this.lastTouchTime?this.lastTouchTime:0);
        this.lastTouchTime = Date.now();
        this.touchStart = event.changedTouches.item(0);
        this.touchPos = [this.touchStart["offsetX"],this.touchStart["offsetY"]];
        if(!this.touchPos[0]){
            this.touchPos = [this.touchStart["clientX"] - this.component.getBoundingClientRect().left, this.touchStart["clientY"] - this.component.getBoundingClientRect().top];
        }
        this.startTouchPos = [this.touchPos[0], this.touchPos[1]];
        event.touchPos = this.touchPos ? [this.touchPos[0], this.touchPos[1]] : [0,0];
        event.translateEvent = this.translateEvent;
        event.scaleEvent = this.scaleEvent;
        this.touchMoveEvents = [];
        this.touchVelocity = 0;
        this.touchMoveCount = 0;
        this.deltaTouchPos = 0;
        this.callHandler("touchstart", event);

        if(this.preventDefault)
            event.preventDefault();
    }
    touchMoveHandler(event:any):boolean
    {
        if(this.registeredTouch !== SingleTouchListener.mouseDown.mouseDown){
            this.touchEndHandler(event);
        }
        let touchMove = event.changedTouches.item(0);
        for(let i = 0; i < event.changedTouches["length"]; i++)
        {
            if(event.changedTouches.item(i).identifier == this.touchStart.identifier){
                touchMove = event.changedTouches.item(i);
            }
        }  
        
        if(touchMove)
        {
            try{
                if(!touchMove["offsetY"])
                {
                    touchMove.offsetY = touchMove["clientY"] - this.component.getBoundingClientRect().top;
                }
                if(!touchMove["offsetX"])
                {
                    touchMove.offsetX = touchMove["clientX"] - this.component.getBoundingClientRect().left;
                }
            }
            catch(error:any)
            {
                console.log(error);
            }
            const deltaY:number = touchMove["offsetY"]-this.touchPos[1];
            const deltaX:number = touchMove["offsetX"]-this.touchPos[0];
            this.touchPos[1] += deltaY;
            this.touchPos[0] += deltaX;
            if(!this.registeredTouch)
                 return false;
             ++this.moveCount;
            const mag:number = this.mag([deltaX, deltaY]);
            this.touchMoveCount++;
            this.deltaTouchPos += Math.abs(mag);
            this.touchVelocity = 100*this.deltaTouchPos/(Date.now() - this.lastTouchTime); 
            const a:Array<number> = this.normalize([deltaX, deltaY]);
            const b:Array<number> = [1,0];
            const dotProduct:number = this.dotProduct(a, b);
            const angle:number = Math.acos(dotProduct)*(180/Math.PI)*(deltaY<0?1:-1);
            event.deltaX = deltaX;
            event.startTouchPos = this.startTouchPos;
            event.deltaY = deltaY;
            event.mag = mag;
            event.angle = angle;
            event.avgVelocity = this.touchVelocity;
            event.touchPos = this.touchPos ? [this.touchPos[0], this.touchPos[1]] : [0,0];
            event.startTouchTime = this.lastTouchTime;
            event.eventTime = Date.now();
            event.moveCount = this.moveCount;
            event.translateEvent = this.translateEvent;
            event.scaleEvent = this.scaleEvent;
            this.touchMoveEvents.push(event);
            this.callHandler("touchmove", event);
        }
        return true;
    }
    touchEndHandler(event:any):void
    {
        if(this.registeredTouch)
        {
            let touchEnd = event.changedTouches.item(0);
            for(let i = 0; i < event.changedTouches["length"]; i++)
            {
                if(event.changedTouches.item(i).identifier === this.touchStart.identifier){
                    touchEnd = event.changedTouches.item(i);
                }
            } 
            if(touchEnd)
            {
                if(!touchEnd["offsetY"])
                {
                    touchEnd.offsetY = touchEnd["clientY"] - this.component.getBoundingClientRect().top;
                }if(!touchEnd["offsetX"])
                {
                    touchEnd.offsetX = touchEnd["clientX"] - this.component.getBoundingClientRect().left;
                }
                const deltaY:number = touchEnd["offsetY"] - this.startTouchPos[1];

                const deltaX:number = touchEnd["offsetX"] - this.startTouchPos[0];
                this.touchPos = [touchEnd["offsetX"], touchEnd["offsetY"]];
                const mag:number = this.mag([deltaX, deltaY]);
                const a:Array<number> = this.normalize([deltaX, deltaY]);
                const b:Array<number> = [1,0];
                const dotProduct:number = this.dotProduct(a, b);
                const angle:number = Math.acos(dotProduct)*(180/Math.PI)*(deltaY<0?1:-1);
                const delay:number = Date.now()-this.lastTouchTime;// from start tap to finish
                this.touchVelocity = 100*mag/(Date.now()-this.lastTouchTime)

                event.deltaX = deltaX;
                event.deltaY = deltaY;
                event.mag = mag;
                event.angle = angle;
                event.avgVelocity = this.touchVelocity;
                event.touchPos = this.touchPos ? [this.touchPos[0], this.touchPos[1]] : [0,0];
                event.timeDelayFromStartToEnd = delay;
                event.startTouchTime = this.lastTouchTime;
                event.eventTime = Date.now();
                event.moveCount = this.moveCount;
                event.translateEvent = this.translateEvent;
                event.scaleEvent = this.scaleEvent;
                
                try 
                {
                    this.callHandler("touchend", event);
                } 
                catch(error:any)
                {
                    console.log(error);
                    this.registeredTouch = false;
                }
            }
            this.touchMoveEvents = [];
            this.registeredTouch = false;
        }
    }
    mag(a:number[]):number
    {
        return Math.sqrt(a[0]*a[0]+a[1]*a[1]);
    }
    normalize(a:number[]):Array<number>
    {
        const magA = this.mag(a);
        a[0] /= magA;
        a[1] /= magA;
        return a;
    }
    dotProduct(a:number[], b:number[]):number
    {
        return a[0]*b[0]+a[1]*b[1];
    }
};
class MultiTouchListenerTypes {
    pinchOut:Array<TouchHandler>;
    pinchIn:Array<TouchHandler>;
    constructor(){
        this.pinchIn = [];
        this.pinchOut = [];
    }
};
class MultiTouchListener {
    lastDistance:number;
    listenerTypeMap:MultiTouchListenerTypes;
    registeredMultiTouchEvent:boolean
    constructor(component:HTMLElement)
    {
        this.lastDistance = 0;
        this.listenerTypeMap = new MultiTouchListenerTypes();
        this.registeredMultiTouchEvent = false;
        if(isTouchSupported())
        {
            component.addEventListener('touchmove', event => this.touchMoveHandler(event), false);
            component.addEventListener('touchend', event => {this.registeredMultiTouchEvent = false; event.preventDefault()}, false);
        }
    }    
    registerCallBack(listenerType:string, predicate:(event:any) => boolean, callBack:(event:any) => void):void
    {
        (<any> this.listenerTypeMap)[listenerType].push(new TouchHandler(predicate, callBack));
    }
    callHandler(type:string, event:any):void
    {
        const handlers:TouchHandler[] = (<any>this.listenerTypeMap)[type];
        handlers.forEach((handler:TouchHandler) => {
            if(!event.defaultPrevented && handler.pred(event))
            {
                handler.callBack(event);
            }
        });
    }
    touchMoveHandler(event:any):void
    {
        const touch1 = event.changedTouches.item(0);
        const touch2 = event.changedTouches.item(1);
        if(SingleTouchListener.mouseDown.getTouchCount() > 1)
        {
            this.registeredMultiTouchEvent = true;
        }
        if(this.registeredMultiTouchEvent)
        {
            const newDist:number = Math.sqrt(Math.pow((touch1.clientX - touch2.clientX),2) + Math.pow(touch1.clientY - touch2.clientY, 2));
            if(this.lastDistance > newDist)
            {
                this.callHandler("pinchOut", event);
            }
            else
            {
                this.callHandler("pinchIn", event);
            }
            event.preventDefault();
            this.lastDistance = newDist;
        }
    }
};
class DynamicInt32Array {
    data:Int32Array;
    len:number;
    constructor(size:number = 4096)
    {
        this.data = new Int32Array(size);
        this.len = 0;
    }
    length(): number
    {
        return this.len;
    }
    push(value:number):void
    {
        if(this.data.length <= this.length())
        {
            const temp:Int32Array = new Int32Array(this.data.length * 2);
            for(let i = 0; i < this.data.length; i++)
            {
                temp[i] = this.data[i];
            }
            this.data = temp;
        }
        this.data[this.len++] = value;
    }
    trimmed(): Int32Array
    {
        const data:Int32Array = new Int32Array(this.length());
        for(let i = 0; i < data.length; i++)
            data[i] = this.data[i];
        return data;
    }
};
function toInt32Array(data:number[]): Int32Array
{
    const newData:Int32Array = new Int32Array(data.length);
    for(let i = 0; i < data.length; i++)
    {
        newData[i] = data[i];
    }
    return newData;
}
function findLeastUsedDoubleWord(buffer:Int32Array): number
{
    const useCount:Map<number, number> = new Map();
    for(let i = 0; i < buffer.length; i++)
    {
        if(useCount.get(buffer[i]))
            useCount.set(buffer[i], useCount.get(buffer[i]) + 1);
        else
            useCount.set(buffer[i], 1);
    }
    let minValue:number = useCount.values().next().value;
    let minUsedKey:number = useCount.keys().next().value;
    for(const [key, value] of useCount.entries())
    {
        if(value < minValue)
        {
            minUsedKey = key;
            minValue = value;
        }
    }
    let random:number = Math.floor(Math.random() * 1000000000);
    for(let i = 0; i < 1000; i++)
    {
        if(!useCount.get(random))
            break;
        const newRandom:number = Math.floor(random * Math.random() * (1 + 10 * (i % 2)));
        if(useCount.get(newRandom) < useCount.get(random))
            random = newRandom;
    }
    if(!useCount.get(random) || useCount.get(random) < useCount.get(minUsedKey))
        return random;
    else
        return minUsedKey;
}
function rleEncode(buffer:Int32Array):Int32Array 
{
    const flag:number = findLeastUsedDoubleWord(buffer);
    const data:number[] = [];
    data.push(flag);
    for(let i = 0; i < buffer.length;)
    {
        const value:number = buffer[i];
        let currentCount:number = 1;
        while(buffer[i + currentCount] === value)
            currentCount++;
        
        if(currentCount > 2 || value === flag)
        {
            data.push(flag);
            data.push(value);
            data.push(currentCount);
            i += currentCount;
        }
        else
        {
            data.push(value);
            i++;
        }
    }
    return toInt32Array(data);
}
function rleDecode(encodedBuffer:Int32Array): Int32Array
{
    const data:number[] = [];
    const flag:number = encodedBuffer[0];
    for(let i = 1; i < encodedBuffer.length;)
    {
        if(encodedBuffer[i] !== flag)
            data.push(encodedBuffer[i]);
        else
        {
            const value:number = encodedBuffer[++i];
            const count:number = encodedBuffer[++i];
            for(let j = 0; j < count; j++)
                data.push(value);
        }
        i++;
        
    }
    return toInt32Array(data);
}
function buildSpriteFromBuffer(buffer:Int32Array, index:number):Pair<Sprite, number>
{
    const size:number = buffer[index++];
    const type:number = buffer[index++];
    const height:number = buffer[index] >> 16;
    const width:number = buffer[index++] & ((1 << 17) - 1);
    const sprite:Sprite = new Sprite([], width, height);
    if(type !== 3)
        throw new Error("Corrupted project file sprite type should be: 3, but is: " + type.toString());
    if(width * height !== size - 3)
        throw new Error("Corrupted project file, sprite width, and height are: (" + width.toString() +","+ height.toString() + "), but size is: " + size.toString());
    const limit:number = width * height;
    const view:Int32Array = new Int32Array(sprite.pixels.buffer);
    for(let i = 0; i < limit; i++)
    {
        view[i] = buffer[index];
        index++;
    }
    sprite.refreshImage();
    return new Pair(sprite, size);
}
function buildSpriteAnimationFromBuffer(buffer:Int32Array, index:number):Pair<SpriteAnimation, number>
{
    const size:number = buffer[index++];
    const type:number = buffer[index++];
    const width:number = buffer[index + 2] >> 16;
    const height:number = buffer[index + 2] & ((1 << 16) - 1);
    if(type !== 2)
        throw new Error("Corrupted project file animation type should be: 2, but is: " + type.toString());
    let i:number = 2;
    const animation:SpriteAnimation = new SpriteAnimation(0, 0, width, height);

    for(; i < size - 2;)
    {
        const result:Pair<Sprite, number> = buildSpriteFromBuffer(buffer, index);
        index += result.second;
        i += result.second;
        animation.pushSprite(result.first);
    }
    let spriteMemory:number = 0;
    animation.sprites.forEach((sprite:Sprite) => spriteMemory += (sprite.pixels.length >> 2) + 3);
    if(spriteMemory !== size - 2)
        throw new Error("Error invalid group size: " + size.toString() + " should be: " + size.toString());
    return new Pair(animation, size);
}
class Sprite {
    pixels:Uint8ClampedArray;
    imageData:ImageData;
    image:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    fillBackground:boolean;
    width:number;
    height:number;
    constructor(pixels:Array<RGB>, width:number, height:number, fillBackground:boolean = true)
    {
        this.fillBackground = fillBackground;
        this.imageData = <any> null;
        this.pixels = <any> null;
        this.image = document.createElement("canvas");
        this.ctx = this.image.getContext("2d")!;
        this.width = width;
        this.height = height;
        this.copy(pixels, width, height);
    }
    
    createImageData():ImageData {

        const canvas = this.image;
        if(canvas.width !== this.width || canvas.height !== this.height)
        {
            canvas.width = this.width;
            canvas.height = this.height;
        }
        this.ctx = canvas.getContext('2d')!;
        this.ctx.imageSmoothingEnabled = false;

        return this.ctx.createImageData(this.width, this.height);
    }
    copy(pixels:Array<RGB>, width:number, height:number):void
    {

        this.width = width;
        this.height = height;
        if(width !== 0 && height !== 0)
        {
            if(!this.pixels || this.pixels.length !== pixels.length || this.pixels.length > 0){
                this.imageData = this.createImageData();
                this.pixels = this.imageData.data;
            }
            const view:Int32Array = new Int32Array(this.pixels.buffer)
            for(let i = 0; i < pixels.length; i++)
            {
                view[i] = pixels[i].color;
            }
            if(pixels.length)
                this.refreshImage();
        }
    }
    putPixels(ctx:CanvasRenderingContext2D):void
    {
        ctx.putImageData(this.imageData, 0, 0);
    }
    fillRect(color:RGB, x:number, y:number, width:number, height:number, view:Int32Array = new Int32Array(this.pixels.buffer))
    {
        for(let yi = y; yi < y+height; yi++)
        {
            const yiIndex:number = (yi*this.width);
            const rowLimit:number = x + width + yiIndex;
            for(let xi = x + yiIndex; xi < rowLimit; xi++)
            {
                view[xi] = color.color;
            }
        }
    }
    fillRectAlphaBlend(source:RGB, color:RGB, x:number, y:number, width:number, height:number, view:Int32Array = new Int32Array(this.pixels.buffer))
    {
        for(let yi = y; yi < y+height; yi++)
        {
            for(let xi = x; xi < x+width; xi++)
            {
                let index:number = (xi) + (yi*this.width);
                source.color = view[index];
                source.blendAlphaCopy(color);
                view[index] = source.color;
            }
        }
    }
    copyToBuffer(buf:Array<RGB>, width:number, height:number, view:Int32Array = new Int32Array(this.pixels.buffer))
    {
        if(width * height !== buf.length)
        {
            console.log("error invalid dimensions supplied");
            return;
        }
        for(let y = 0; y < this.height && y < height; y++)
        {
            for(let x = 0; x < this.width && x < width; x++)
            {
                const i:number = (x + y * width);
                const vi:number = x + y * this.width;
                buf[i].color = view[vi];
            }
        }
    }
    binaryFileSize():number
    {
        return 3 + this.width * this.height;
    }
    saveToUint32Buffer(buf:Int32Array, index:number, view:Int32Array = new Int32Array(this.pixels.buffer)):number
    {
        buf[index++] = this.binaryFileSize();
        buf[index++] = 3;
        buf[index] |= this.height << 16; 
        buf[index++] |= this.width; 
        for(let i = 0; i < view.length; i++)
        {
            buf[index] = view[i];
            index++;
        }
        return index;
    }
    refreshImage():void 
    {
        const canvas = this.image;
        if(canvas.width !== this.width || canvas.height !== this.height)
        {
            canvas.width = this.width;
            canvas.height = this.height;
            this.ctx = canvas.getContext("2d")!;
        }
        this.putPixels(this.ctx);
    }
    copySprite(sprite:Sprite):void
    {
        this.width = sprite.width;
        this.height = sprite.height;
        if(!this.pixels || this.pixels.length !== sprite.pixels.length)
        {
            this.imageData = this.createImageData();
            this.pixels = this.imageData.data;
        }
        for(let i = 0; i < this.pixels.length;)
        {
            this.pixels[i] = sprite.pixels[i++];
            this.pixels[i] = sprite.pixels[i++];
            this.pixels[i] = sprite.pixels[i++];
            this.pixels[i] = sprite.pixels[i++];
        }
    }
    copySpriteBlendAlpha(sprite:Sprite):void
    {
        if(this.pixels.length !== sprite.pixels.length){
            this.imageData = this.createImageData();
            this.pixels = this.imageData.data;
        }
        this.width = sprite.width;
        this.height = sprite.height;
        const o:RGB = new RGB(0, 0, 0, 0);
        const t:RGB = new RGB(0, 0, 0, 0);

        for(let i = 0; i < this.pixels.length; i += 4)
        {
            o.setRed(sprite.pixels[i]);
            o.setGreen(sprite.pixels[i+1]);
            o.setBlue(sprite.pixels[i+2]);
            o.setAlpha(sprite.pixels[i+3]);
            t.setRed(this.pixels[i]);
            t.setGreen(this.pixels[i+1]);
            t.setBlue(this.pixels[i+2]);
            t.setAlpha(this.pixels[i+3]);
            t.blendAlphaCopy(o);
            this.pixels[i] = t.red();
            this.pixels[i+1] = t.green();
            this.pixels[i+2] = t.blue();
            this.pixels[i+3] = t.alpha();
        }
    }
    draw(ctx:CanvasRenderingContext2D, x:number, y:number, width:number, height:number):void
    {
        if(this.pixels){ 
            if(this.fillBackground){
                ctx.clearRect(x, y, width, height);
            }
            ctx.drawImage(this.image, x, y, width, height);
        }
    }
};
class SpriteAnimation {
    sprites:Sprite[];
    x:number;
    y:number;
    width:number;
    height:number;
    animationIndex:number;

    constructor(x:number, y:number, width:number, height:number)
    {
        this.sprites = [];
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.animationIndex = 0;
    }
    pushSprite(sprite:Sprite):void
    {
        this.sprites.push(sprite);
    }
    binaryFileSize():number
    {
        let size:number = 2;
        this.sprites.forEach((sprite:Sprite) => size += sprite.binaryFileSize());
        return size;
    }
    toGifBlob(callBack:(blob:Blob) => void, fps:number = 30):void
    {
        const frameTime:number = 1000/fps;
        const gif = new GIF({
            workers: 2,
            quality: 10
          });
          // add an image element
          for(let i = 0; i < this.sprites.length; i++)
            gif.addFrame(this.sprites[i].image, {delay:Math.ceil(frameTime)});
          
          gif.on('finished', function(blob:Blob) {
            callBack(blob);
          });
          
          gif.render();
    }
    saveToUint32Buffer(buf:Int32Array, index:number):number
    {
        buf[index++] = this.binaryFileSize();
        buf[index++] = 2;
        this.sprites.forEach((sprite:Sprite) => index = sprite.saveToUint32Buffer(buf, index));
        return index;
    }
    cloneAnimation():SpriteAnimation
    {
        
        const cloned:SpriteAnimation = new SpriteAnimation(0, 0, this.width, this.height);
        const original:SpriteAnimation = this;
        original.sprites.forEach((sprite:Sprite) => {
            const clonedSprite:Sprite = new Sprite([], sprite.width, sprite.height);
            clonedSprite.copySprite(sprite);
            clonedSprite.refreshImage();
            cloned.sprites.push(clonedSprite);
        });
        return cloned;
    }
    draw(ctx:CanvasRenderingContext2D, x:number, y:number, width:number, height:number):void
    {
        if(this.sprites.length){
            ++this.animationIndex;
            this.sprites[this.animationIndex %= this.sprites.length].draw(ctx, x, y, width, height);
        }
        else{
            this.animationIndex = -1;
        }
    }
};
async function fetchImage(url:string):Promise<HTMLImageElement>
{
    const img = new Image();
    img.src =  URL.createObjectURL(await (await fetch(url)).blob());
    return img;
}
function logToServer(data:any):void
{
    fetch("/data", {
        method: "POST", 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      }).then(res => {console.log("Request complete! response:", data);});

}
function saveBlob(blob:Blob, fileName:string){
    const a:HTMLAnchorElement = document.createElement("a");
    if(blob)
    {
        a.href = window.URL.createObjectURL(blob);
        a.download = fileName;
        a.click();
    }
}
function getWidth():number {
    return Math.min(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    );
  }
  function getHeight():number {
      return Math.min(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.documentElement.clientHeight
      );
    }

  const max_32_bit_signed:number = Math.pow(2, 31);
  let rand_state:number = 34;
  function srand(seed:number):void
  {
      rand_state = seed;
  }
  function random():number
  {
    rand_state *= 1997;
    rand_state ^= rand_state << 5;
    rand_state ^= rand_state >> 18;
    rand_state *= 1997;
    rand_state ^= rand_state << 7;
    rand_state = Math.abs(rand_state);
    return (rand_state) * 1 / max_32_bit_signed;
  }
interface Attackable {
    dim():number[];
    attack(enemy:Attackable):void;
    offense():number;
    defense():number; //0 - 1 //1 is 100% // 0 is 0%
    lose_hp(hp:number, enemy:Attackable):void;
    get_faction():Faction;
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
    check_collision(other:SquareAABBCollidable):boolean
    {
        return this.x < other.x + other.width && other.x < this.x + this.width && 
            this.y < other.y + other.height && other.y < this.y + this.height;
    }
}
function distance(a:SquareAABBCollidable, b:SquareAABBCollidable):number
{
    const dx = a.mid_x() - b.mid_x();
    const dy = a.mid_y() - b.mid_y();
    return Math.sqrt(dx*dx + dy*dy);
}
class Faction {
    //faction stats that are static
    name:string;
    money:number;
    color:RGB;
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
    //for move calculation
    avg_move_value:number;
    sum_move_points:number;
    count_moves:number;
    
    constructor(name:string, color:RGB, fort_reproduction_unit_limit:number)
    {
        this.name = name;
        this.attack = 4 * (1 + random() / 5);
        this.avg_move_value = 0;
        this.sum_move_points = 800 * (0.5 + random());
        this.count_moves = 1;
        this.starting_unit_hp = 10;
        this.fort_defense = 0.15 * (0.75 + random());
        this.unit_defense = 0.05 * (0.75 + random());
        this.color = color;
        this.unit_reproduction_per_second = Math.floor(2.5 * (0.95 + random() / 10));
        this.money_production_per_second = 10;
        this.fort_reproduction_unit_limit = fort_reproduction_unit_limit;
        this.unit_travel_speed = Math.max(getWidth(), getHeight()) / 10;
    }
};
class Unit extends SquareAABBCollidable implements Attackable {
    faction:Faction;
    currentFort:Fort|null;
    targetFort:Fort;
    hp:number;
    constructor(faction:Faction, fort:Fort, x:number, y:number)
    {
        super(x, y, Math.ceil(faction.battleField.fort_dim / 6), Math.ceil(faction.battleField.fort_dim / 6));
        this.faction = faction;
        this.hp = faction.starting_unit_hp;
        this.currentFort = fort;
        this.targetFort = fort;
    }
    draw(canvas:HTMLCanvasElement, ctx:CanvasRenderingContext2D):void
    {
        ctx.fillStyle = this.faction.color.htmlRBG();
        ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.width, this.height);
        ctx.strokeStyle = "#000000";
        ctx.strokeRect(Math.floor(this.x), Math.floor(this.y), this.width, this.height)
    }
    update_state(delta_time:number):boolean
    {
        if(distance(this, this.targetFort) < Math.floor(this.targetFort.width / 2))
        {
            if(this.targetFort.faction === this.faction)
            {
                this.targetFort.units.push(this);
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
            if(ndy*ndy > dy*dy || ndx*ndx > dx*dx)
            {
                ndx = dx / 2;
                ndy = dy / 2;
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
        this.font_size = Math.ceil(this.faction.battleField.fort_dim / 4);
        this.font_name = "Helvetica";
    }
    update_state(delta_time:number):void
    {
        //reproduce new units
        if(this.units.length < this.faction.fort_reproduction_unit_limit && Date.now() - this.last_update_unit_reproduction > (1000 / this.faction.unit_reproduction_per_second))
        {
            const head = this.units.pop();
            this.units.push(new Unit(this.faction, this, this.mid_x(), this.mid_y()));
            if(head)
                this.units.push(head);
            
            this.last_update_unit_reproduction = Date.now();
        }
        //send out leaving units
        if(Date.now() - this.last_update_units_leaving > 250)
        {
            const limit:number = Math.min(3, this.leaving_units.length);
            for(let i = 0; i < limit; i++)
            {
                const unit = this.leaving_units.pop();
                unit!.x += i * unit!.width;
                unit!.y += i * unit!.height;
                this.faction.battleField.traveling_units.push(unit!);
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
        ctx.fillStyle = this.faction.color.htmlRBG();
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.font = `${this.font_size}px ${this.font_name}`;
        if((this.faction.color.green() + this.faction.color.red() + this.faction.color.blue()) / 3 > (100))
            ctx.fillStyle = "#000000";
        else
            ctx.fillStyle = "#FFFFFF";
        ctx.fillText((this.units.length + this.leaving_units.length) + "", this.mid_x(), this.mid_y(), this.width / 2);  
        if(this.faction == this.faction.battleField.player_faction())
        {
            ctx.fillText("player", this.mid_x() - this.width / 4, this.mid_y() + this.font_size, this.width / 2);  
        }  
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

    constructor(fort:Fort, defense_power:number, defense_leaving_forces:number)
    {
        this.fort = fort;
        this.defense_power = defense_power;
        this.defense_leaving_forces = defense_leaving_forces;
        this.attacking_force = 0;
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
function calc_points_move(attacker:FortAggregate, defender:FortAggregate, delta_time:number):number
{
    let points = 0;
    const time_to_travel:number = (distance(attacker.fort, defender.fort) / attacker.fort.faction.unit_travel_speed);
    const def_repro_per_frame = defender.fort.faction.unit_reproduction_per_second / (60);

    const enemy_after_time_to_travel_hp:number = (time_to_travel * def_repro_per_frame < defender.fort.faction.fort_reproduction_unit_limit ?
        time_to_travel * def_repro_per_frame : 
        defender.fort.faction.fort_reproduction_unit_limit) + defender.defense_power;
    if(attacker.fort.faction === defender.fort.faction)
    {
        //points += (attacker.defense_power - enemy_after_time_to_travel_hp * 2) / 5;
        //points -= time_to_travel * (1000 / delta_time);
        //points = -1000;
        //points += (attacker.defense_power) - (enemy_after_time_to_travel_hp + defender.defense_leaving_forces);
    }
    else{
        points += (attacker.defense_power);
        //points += 25;
    }
    points -= (enemy_after_time_to_travel_hp + defender.defense_leaving_forces / 2) + attacker.attacking_force;
    points -= defender.attacking_force / 15;

    return points;
}
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
    //has all the forts
    //forts know what faction owns them, how many units they have
    //units know what faction they belong to from there they derive their attack/defense
    //has list of factions
    //factions have offense/defense stats all owned forts take on, and attacking units take on
    constructor(game:Game, dimensions:number[], factions:Faction[], fort_dim:number, fort_count:number, no_ownership_unit_limit:number)
    {
        this.game = game;
        this.factions = [];
        this.forts = [];
        this.traveling_units = [];
        this.player_faction_index = 1;
        this.fort_dim = fort_dim;
        this.factions.push(new Faction("none", new RGB(125, 125, 125), no_ownership_unit_limit));
        this.factions[0].battleField = this;
        this.dimensions = dimensions;
        this.canvas = document.createElement("canvas");
        this.canvas.width = dimensions[2];
        this.canvas.height = dimensions[3];
        this.ctx = this.canvas.getContext("2d")!;
        const factions_copy:Faction[] = [];
        factions_copy.push(this.factions[0]);
        for(let i = 0; i < factions.length; i++)
        {
            const to_copy = factions[i];
            to_copy.battleField = this;
            this.factions.push(to_copy);
            factions_copy.push(to_copy);
        }

        for(let i = 0; i < fort_count; i++)
        {
            const placed_fort:Fort = this.place_random_fort(factions_copy);
            const faction_index = factions_copy.indexOf(placed_fort.faction);
            if(faction_index > 0)
                factions_copy.splice(faction_index, 1);
        }
    }
    player_faction():Faction
    {
        return this.factions[this.player_faction_index];
    }
    draw(canvas:HTMLCanvasElement, ctx:CanvasRenderingContext2D):void
    {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.forts.forEach(fort => fort.draw(this.canvas, this.ctx));
        this.traveling_units.forEach(unit => unit.draw(this.canvas, this.ctx));
        ctx.clearRect(this.dimensions[0], this.dimensions[1], this.dimensions[2], this.dimensions[3])
        ctx.drawImage(this.canvas, this.dimensions[0], this.dimensions[1]);
    }
    handleAI(delta_time:number):void
    {
        let records:FortAggregate[] = [];
        const fort_index_lookup:Map<Fort, number> = new Map();
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

        }
        for(let i = 0; i < records.length; i++)
        {
            const record:FortAggregate = records[i];
            if(record.fort.faction !== this.factions[0] && record.fort.faction !== this.factions[1])
            {
                //not no faction, and not player
                let max_points:number = calc_points_move(record, records[0], delta_time);
                let max_index:number = 0;
                for(let j = 1; j < records.length; j++)
                {
                    const points:number = calc_points_move(record, records[j], delta_time);
                    if(max_points < points)
                    {
                        max_points = points;
                        max_index = j;
                    }
                }
                if((max_points - record.fort.faction.avg_move_value) > 100)
                {
                    record.fort.faction.sum_move_points += max_points;
                    record.fort.faction.count_moves++;
                    record.fort.faction.avg_move_value = record.fort.faction.sum_move_points / record.fort.faction.count_moves;
                
                    if(max_points > 10)
                    {
                        console.log(record.fort.faction.name, "\n", max_points,"\n", record.fort.faction.avg_move_value)
                        record.fort.auto_send_units(records[max_index].fort);
                    }
                    if(record.fort.faction.avg_move_value > 1550)
                    {
                        record.fort.faction.sum_move_points = 1100 * record.fort.faction.count_moves;
                        record.fort.faction.avg_move_value = 1100;
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
            for(let j = 0; j < this.traveling_units.length; j++)
            {
                const other = this.traveling_units[j];
                if(unit.check_collision(other))
                {
                    if(other.faction !== unit.faction)
                    {
                            unit.attack(other);
                            other.attack(unit);
                            if(other.hp <= 0)
                                this.traveling_units.splice(j, 1);

                            if(unit.hp <= 0)
                            {
                                this.traveling_units.splice(i, 1);
                                break;
                            }

                        
                    }
                    else
                    {
                        
                    }
                }
            }
        }
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
        const x = Math.floor(random() * (this.dimensions[2] - this.fort_dim) + this.dimensions[0]);
        const y = Math.floor(random() * (this.dimensions[3] - this.fort_dim) + this.dimensions[1]);
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
    increase_function:null | ((x:number) => number);

    constructor(next:(x:number) => number, frame:UpgradeScreen, attribute_name:string, short_name:string, pixelDim:number[], x:number, y:number)
    {
        super([1, 20], pixelDim, x, y);
        this.frame = frame;
        const fontSize = isTouchSupported() ? 20:16;
        this.increase_function = next;
        this.attribute_name = attribute_name;
        this.display_value = new GuiButton(() => {
            this.increment_attribute();
            this.frame.game.new_game();
        }, this.get_value() + "", pixelDim[0], fontSize * 2, fontSize);
        this.display_name = new GuiTextBox(false, pixelDim[0], this.display_value, fontSize, fontSize * 2, GuiTextBox.default);
        this.display_name.setText(short_name);
        this.display_name.refresh();
        this.display_value.refresh();
        this.createHandlers(this.frame.game.keyboard_handler, this.frame.game.touch_listener);
        this.addElement(this.display_name);
        this.addElement(this.display_value);
        this.setHeight(this.display_name.height() + this.display_value.height() + 10);
    }
    increment_attribute():void
    {
        if(this.increase_function)
        {
            this.frame.faction[this.attribute_name] += this.increase_function(this.frame.faction[this.attribute_name]);
            this.display_value.text = this.get_value() + "";
            this.display_value.refresh();
        }
    }
    get_value():number|string
    {
        if(this.frame.faction[this.attribute_name] !== undefined)
            return Math.round(this.frame.faction[this.attribute_name] * 1000) / 1000;
        else
            return "No Upgrades";
    }
    
};
class UpgradeScreen extends SimpleGridLayoutManager {
    faction:Faction;
    game:Game;
    constructor(faction:Faction, game:Game, pixelDim:number[], x:number, y:number)
    {
        super([6, 20], pixelDim, x, y);
        this.faction = faction;
        this.game = game;
        let diff_log = (x:number, offset:number = 0) => Math.log(x + 1 + offset) - Math.log(x + offset);
        const panel_height = pixelDim[1] / 5;
        const panel_width = Math.floor(pixelDim[0] / 3);
        const attack = new UpgradePanel(diff_log, this, "attack", "Attack", [panel_width, panel_height], 0, 0);
        this.addElement(attack);
    {
        const upgrades = new UpgradePanel((x:number) => diff_log(x, 14), this, "unit_reproduction_per_second", "units per sec", [panel_width, panel_height], 0, 0);
        this.addElement(upgrades);
    }
    {
        const upgrades = new UpgradePanel((x:number) => diff_log(x, 100), this, "unit_defense", "unit defense", [panel_width, panel_height], 0, 0);
        this.addElement(upgrades);
    }

    {
        const upgrades = new UpgradePanel((x:number) => diff_log(x, 95), this, "fort_defense", "fort defense", [panel_width, panel_height], 0, 0);
        this.addElement(upgrades);
    }

    {
        const upgrades = new UpgradePanel((x:number) => diff_log(x, Math.floor(1-this.faction.starting_unit_hp)), this, "starting_unit_hp", "unit hp", [panel_width, panel_height], 0, 0);
        this.addElement(upgrades);
    }
    {
        const upgrades = new UpgradePanel((x:number) => pixelDim[1] / 100, this, "unit_travel_speed", "unit speed", [panel_width, panel_height], 0, 0);
        this.addElement(upgrades);
    }
    {
        this.addElement(new GuiSpacer([panel_width, panel_height]));
        const upgrades = new UpgradePanel((x:number) => pixelDim[1] / 100, this, "null", "Skip", [panel_width, panel_height], 0, 0);
        upgrades.increase_function = null;
        this.addElement(upgrades);
    }
        this.refresh();

    }
};
class Game {
    currentField:BattleField;
    factions:Faction[];
    start_touch_fort:Fort;
    upgrade_menu:UpgradeScreen;
    touch_listener:SingleTouchListener;
    keyboard_handler:KeyboardHandler;
    constructor(canvas:HTMLCanvasElement, factions:Faction[])
    {
        this.factions = factions;
        const width = canvas.width;
        const height = canvas.height;
        this.currentField = new BattleField(this, [0, 0, width, height], this.factions, Math.max(width, height) / 20, 10, 20);
        const is_player = (e:any) => this.currentField.find_nearest_fort(e.touchPos[0], e.touchPos[1]).faction === this.currentField.player_faction()
        this.keyboard_handler = new KeyboardHandler();
        this.touch_listener = new SingleTouchListener(canvas, true, true, false);
        this.touch_listener.registerCallBack("touchstart", is_player, (event:any) => {
            this.start_touch_fort = this.currentField.find_nearest_fort(event.touchPos[0], event.touchPos[1]);
            console.log("start touch pos:", event.touchPos);
            console.log("start: ",this.start_touch_fort);
        });
        this.touch_listener.registerCallBack("touchend", (e:any) => this.start_touch_fort && this.start_touch_fort.faction === this.currentField.player_faction(), (event:any) => {
            const end_touch_fort = this.currentField.find_nearest_fort(event.touchPos[0], event.touchPos[1]);
            console.log("end touch pos:", event.touchPos);
            console.log("end  fort: ", end_touch_fort);
            if(this.start_touch_fort === end_touch_fort)
            {
                this.start_touch_fort.unsend_units();
            }
            else
            {
                this.start_touch_fort.send_units(end_touch_fort);
            }
        });
        this.upgrade_menu = new UpgradeScreen(this.currentField.player_faction(), this, [canvas.width / 2 + 100, canvas.height / 2], canvas.width / 4 - 50, canvas.height / 4);
        this.upgrade_menu.refresh();
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
    update_state(delta_time:number):void
    {
        if(this.is_game_over())
        {
            this.upgrade_menu.activate();
        }
        else
        {
            this.currentField.update_state(delta_time);
        }
    }
    draw(canvas:HTMLCanvasElement, ctx:CanvasRenderingContext2D):void
    {
        if(!this.is_game_over())
            this.currentField.draw(canvas, ctx);
        else
        {
            this.upgrade_menu.activate();
            this.upgrade_menu.draw(ctx);
        }
    }
    find_non_player_or_null_owned_fort_faction():Faction|null
    {
        let i = 1;
        let faction:Faction = this.currentField.forts[0].faction;
        while(i < this.currentField.forts.length && (faction === this.factions[0] || faction === this.factions[1]))
        {
            faction = this.currentField.forts[i].faction;
            i++;
        }
        if(i < this.currentField.forts.length)
            return faction;
        else
            return null;
    }
    is_game_over():boolean
    {
        if((!this.is_faction_on_field(this.currentField.player_faction()) || !this.find_non_player_or_null_owned_fort_faction()))
        {
            return true;
        }
        return false;
    }
    new_game():void
    {
        this.upgrade_menu.deactivate();
        this.currentField = new BattleField(this, this.currentField.dimensions, this.factions, this.currentField.fort_dim, 10, 20);
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
    const factions:Faction[] = [];
    srand(6);
    // seeds 607, 197 are pretty good so far lol
    for(let i = 0; i < 10; i++)
    {
        factions.push(new Faction("Faction "+i, new RGB(random() * 256, random() * 256, random() * 256), 120));
    }
    srand(Math.random() * max_32_bit_signed);
    const game = new Game(canvas, factions);
    let start = Date.now();
    const drawLoop = async () => 
    {
        game.update_state(Date.now() - start);
        start = Date.now();
        game.draw(canvas, ctx);
        requestAnimationFrame(drawLoop);
    }
    drawLoop();

}
main();