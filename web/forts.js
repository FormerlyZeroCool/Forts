function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function changeFavicon(src) {
    let link = document.createElement('link'), oldLink = document.getElementById('dynamic-favicon');
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
const dim = [128, 128];
;
function threeByThreeMat(a, b) {
    return [a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
        a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
        a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
        a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
        a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
        a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
        a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
        a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
        a[6] * b[2] + a[7] * b[5] + a[8] * b[8]];
}
function matByVec(mat, vec) {
    return [mat[0] * vec[0] + mat[1] * vec[1] + mat[2] * vec[2],
        mat[3] * vec[0] + mat[4] * vec[1] + mat[5] * vec[2],
        mat[6] * vec[0] + mat[7] * vec[1] + mat[8] * vec[2]];
}
class Queue {
    constructor() {
        this.data = [];
        this.data.length = 64;
        this.start = 0;
        this.end = 0;
        this.length = 0;
    }
    push(val) {
        if (this.length === this.data.length) {
            const newData = [];
            newData.length = this.data.length * 2;
            for (let i = 0; i < this.data.length; i++) {
                newData[i] = this.data[(i + this.start) % this.data.length];
            }
            this.start = 0;
            this.end = this.data.length;
            this.data = newData;
            this.data[this.end++] = val;
            this.length++;
        }
        else {
            this.data[this.end++] = val;
            this.end &= this.data.length - 1;
            this.length++;
        }
    }
    pop() {
        if (this.length) {
            const val = this.data[this.start];
            this.start++;
            this.start &= this.data.length - 1;
            this.length--;
            return val;
        }
        throw new Error("No more values in the queue");
    }
    get(index) {
        if (index < this.length) {
            return this.data[(index + this.start) & (this.data.length - 1)];
        }
        throw new Error(`Could not get value at index ${index}`);
    }
    set(index, obj) {
        if (index < this.length) {
            this.data[(index + this.start) & (this.data.length - 1)] = obj;
        }
        throw new Error(`Could not set value at index ${index}`);
    }
}
;
class FixedSizeQueue {
    constructor(size) {
        this.data = [];
        this.data.length = size;
        this.start = 0;
        this.end = 0;
        this.length = 0;
    }
    push(val) {
        if (this.length === this.data.length) {
            this.start++;
            this.data[this.end++] = val;
            this.start &= this.data.length - 1;
            this.end &= this.data.length - 1;
        }
        else {
            this.data[this.end++] = val;
            this.end &= this.data.length - 1;
            this.length++;
        }
    }
    pop() {
        if (this.length) {
            const val = this.data[this.start];
            this.start++;
            this.start &= this.data.length - 1;
            this.length--;
            return val;
        }
        throw new Error("No more values in the queue");
    }
    get(index) {
        if (index < this.length) {
            return this.data[(index + this.start) & (this.data.length - 1)];
        }
        throw new Error(`Could not get value at index ${index}`);
    }
    set(index, obj) {
        if (index < this.length) {
            this.data[(index + this.start) & (this.data.length - 1)] = obj;
        }
        throw new Error(`Could not set value at index ${index}`);
    }
}
;
class RollingStack {
    constructor(size = 75) {
        this.data = [];
        this.start = 0;
        this.end = 0;
        this.reserve = size;
        this.size = 0;
        for (let i = 0; i < size; i++)
            this.data.push();
    }
    empty() {
        this.start = 0;
        this.end = 0;
        this.size = 0;
    }
    length() {
        return this.size;
    }
    pop() {
        if (this.size) {
            this.size--;
            this.end--;
            if (this.end < 0)
                this.end = this.reserve - 1;
            return this.data[this.end];
        }
        return null;
    }
    push(val) {
        if (this.size >= this.reserve) {
            this.start++;
            this.start %= this.reserve;
            this.size--;
        }
        this.size++;
        this.data[this.end++] = val;
        this.end %= this.reserve;
    }
    set(index, obj) {
        this.data[(this.start + index) % this.reserve] = obj;
    }
    get(index) {
        return this.data[(this.start + index) % this.reserve];
    }
}
;
function blendAlphaCopy(color0, color) {
    const alphant = color0.alphaNormal();
    const alphanc = color.alphaNormal();
    const a = (1 - alphanc);
    const a0 = (alphanc + alphant * a);
    const a1 = 1 / a0;
    color0.color = (((alphanc * color.red() + alphant * color0.red() * a) * a1)) |
        (((alphanc * color.green() + alphant * color0.green() * a) * a1) << 8) |
        (((alphanc * color.blue() + alphant * color0.blue() * a) * a1) << 16) |
        ((a0 * 255) << 24);
    /*this.setRed  ((alphanc*color.red() +   alphant*this.red() * a ) *a1);
    this.setBlue ((alphanc*color.blue() +  alphant*this.blue() * a) *a1);
    this.setGreen((alphanc*color.green() + alphant*this.green() * a)*a1);
    this.setAlpha(a0*255);*/
}
class RGB {
    constructor(r = 0, g = 0, b, a = 0) {
        this.color = 0;
        this.color = a << 24 | b << 16 | g << 8 | r;
    }
    blendAlphaCopy(color) {
        blendAlphaCopy(this, color);
        /*this.setRed  ((alphanc*color.red() +   alphant*this.red() * a ) *a1);
        this.setBlue ((alphanc*color.blue() +  alphant*this.blue() * a) *a1);
        this.setGreen((alphanc*color.green() + alphant*this.green() * a)*a1);
        this.setAlpha(a0*255);*/
    }
    toHSL() {
        const normRed = this.red() / 255;
        const normGreen = this.green() / 255;
        const normBlue = this.blue() / 255;
        const cMax = Math.max(normBlue, normGreen, normRed);
        const cMin = Math.min(normBlue, normGreen, normRed);
        const delta = cMax - cMin;
        let hue = 0;
        if (delta !== 0) {
            if (cMax === normRed) {
                hue = 60 * ((normGreen - normBlue) / delta % 6);
            }
            else if (cMax === normGreen) {
                hue = 60 * ((normBlue - normRed) / delta + 2);
            }
            else {
                hue = 60 * ((normRed - normGreen) / delta + 4);
            }
        }
        const lightness = (cMax + cMin) / 2;
        const saturation = delta / (1 - Math.abs(2 * lightness - 1));
        return [hue, saturation, lightness];
    }
    setByHSL(hue, saturation, lightness) {
        const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
        const x = c * (1 - Math.abs(hue / 60 % 2 - 1));
        const m = lightness - c / 2;
        if (hue < 60) {
            this.setRed((c + m) * 255);
            this.setGreen((x + m) * 255);
            this.setBlue(0);
        }
        else if (hue < 120) {
            this.setRed((x + m) * 255);
            this.setGreen((c + m) * 255);
            this.setBlue(m * 255);
        }
        else if (hue < 180) {
            this.setRed(m * 255);
            this.setGreen((c + m) * 255);
            this.setBlue((x + m) * 255);
        }
        else if (hue < 240) {
            this.setRed(0);
            this.setGreen((x + m) * 255);
            this.setBlue((c + m) * 255);
        }
        else if (hue < 300) {
            this.setRed((x + m) * 255);
            this.setGreen(m * 255);
            this.setBlue((c + m) * 255);
        }
        else {
            this.setRed((c + m) * 255);
            this.setGreen(m * 255);
            this.setBlue((x + m) * 255);
        }
        this.setAlpha(255);
    }
    compare(color) {
        return color && this.color === color.color;
    }
    copy(color) {
        this.color = color.color;
    }
    toInt() {
        return this.color;
    }
    toRGBA() {
        return [this.red(), this.green(), this.blue(), this.alpha()];
    }
    alpha() {
        return (this.color >> 24) & ((1 << 8) - 1);
    }
    blue() {
        return (this.color >> 16) & ((1 << 8) - 1);
    }
    green() {
        return (this.color >> 8) & ((1 << 8) - 1);
    }
    red() {
        return (this.color) & ((1 << 8) - 1);
    }
    alphaNormal() {
        return Math.round((((this.color >> 24) & ((1 << 8) - 1)) / 255) * 100) / 100;
    }
    setAlpha(red) {
        this.color &= (1 << 24) - 1;
        this.color |= red << 24;
    }
    setBlue(green) {
        this.color &= ((1 << 16) - 1) | (((1 << 8) - 1) << 24);
        this.color |= green << 16;
    }
    setGreen(blue) {
        this.color &= ((1 << 8) - 1) | (((1 << 16) - 1) << 16);
        this.color |= blue << 8;
    }
    setRed(alpha) {
        this.color &= (((1 << 24) - 1) << 8);
        this.color |= alpha;
    }
    loadString(color) {
        try {
            let r;
            let g;
            let b;
            let a;
            if (color.substring(0, 4).toLowerCase() !== "rgba") {
                if (color[0] !== "#")
                    throw new Error("Exception malformed color: " + color);
                r = parseInt(color.substring(1, 3), 16);
                g = parseInt(color.substring(3, 5), 16);
                b = parseInt(color.substring(5, 7), 16);
                a = parseFloat(color.substring(7, 9)) * 255;
            }
            else {
                const vals = color.split(",");
                vals[0] = vals[0].split("(")[1];
                vals[3] = vals[3].split(")")[0];
                r = parseInt(vals[0], 10);
                g = parseInt(vals[1], 10);
                b = parseInt(vals[2], 10);
                a = parseFloat(vals[3]) * 255;
            }
            let invalid = 0;
            if (!isNaN(r) && r >= 0) {
                if (r > 255) {
                    this.setRed(255);
                    invalid = 2;
                }
                else
                    this.setRed(r);
            }
            else
                invalid = +(r > 0);
            if (!isNaN(g) && g >= 0) {
                if (g > 255) {
                    this.setGreen(255);
                    invalid = 2;
                }
                else
                    this.setGreen(g);
            }
            else
                invalid = +(g > 0);
            if (!isNaN(b) && b >= 0) {
                if (b > 255) {
                    this.setBlue(255);
                    invalid = 2;
                }
                else
                    this.setBlue(b);
            }
            else
                invalid = +(b > 0);
            if (!isNaN(a) && a >= 0) {
                if (a > 255) {
                    this.setAlpha(255);
                    invalid = 2;
                }
                else
                    this.setAlpha(a);
            }
            else
                invalid = +(a > 0);
            if (color[color.length - 1] !== ")")
                invalid = 1;
            let openingPresent = false;
            for (let i = 0; !openingPresent && i < color.length; i++) {
                openingPresent = color[i] === "(";
            }
            if (!openingPresent)
                invalid = 1;
            return invalid;
        }
        catch (error) {
            console.log(error);
            return 0;
        }
    }
    htmlRBGA() {
        return `rgba(${this.red()}, ${this.green()}, ${this.blue()}, ${this.alphaNormal()})`;
    }
    htmlRBG() {
        const red = this.red() < 16 ? `0${this.red().toString(16)}` : this.red().toString(16);
        const green = this.green() < 16 ? `0${this.green().toString(16)}` : this.green().toString(16);
        const blue = this.blue() < 16 ? `0${this.blue().toString(16)}` : this.blue().toString(16);
        return `#${red}${green}${blue}`;
    }
}
;
class Pair {
    constructor(first, second) {
        this.first = first;
        this.second = second;
    }
}
;
class ImageContainer {
    constructor(imageName, imagePath, callBack = (img) => console.log(imageName + " loaded.")) {
        this.image = null;
        if (imagePath && imageName)
            fetchImage(imagePath).then(img => {
                this.image = img;
                callBack(img);
            });
        this.name = imageName;
    }
}
;
;
class LexicoGraphicNumericPair extends Pair {
    constructor(rollOver) {
        super(0, 0);
        this.rollOver = rollOver;
    }
    incHigher(val = 1) {
        this.first += val;
        return this.first;
    }
    incLower(val = 1) {
        this.first += Math.floor((this.second + val) / this.rollOver);
        this.second = (this.second + val) % this.rollOver;
        return this.second;
    }
    hash() {
        return this.first * this.rollOver + this.second;
    }
}
;
class RowRecord {
    constructor(x, y, width, height, element) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.element = element;
    }
}
class SimpleGridLayoutManager {
    constructor(matrixDim, pixelDim, x = 0, y = 0) {
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
        this.canvas = document.createElement("canvas");
        this.canvas.width = pixelDim[0];
        this.canvas.height = pixelDim[1];
        this.ctx = this.canvas.getContext("2d");
        this.elementTouched = null;
    }
    createHandlers(keyboardHandler, touchHandler) {
        if (keyboardHandler) {
            keyboardHandler.registerCallBack("keydown", (e) => this.active(), (e) => { e.keyboardHandler = keyboardHandler; this.elements.forEach(el => el.handleKeyBoardEvents("keydown", e)); });
            keyboardHandler.registerCallBack("keyup", (e) => this.active(), (e) => { e.keyboardHandler = keyboardHandler; this.elements.forEach(el => el.handleKeyBoardEvents("keyup", e)); });
        }
        if (touchHandler) {
            touchHandler.registerCallBack("touchstart", (e) => this.active(), (e) => this.handleTouchEvents("touchstart", e));
            touchHandler.registerCallBack("touchmove", (e) => this.active(), (e) => this.handleTouchEvents("touchmove", e));
            touchHandler.registerCallBack("touchend", (e) => this.active(), (e) => this.handleTouchEvents("touchend", e));
        }
    }
    isLayoutManager() {
        return true;
    }
    handleKeyBoardEvents(type, e) {
        this.elements.forEach(el => el.handleKeyBoardEvents(type, e));
        if (e.repaint) {
            this.refreshCanvas();
        }
    }
    handleTouchEvents(type, e) {
        if (!this.elementTouched && e.touchPos[0] >= 0 && e.touchPos[0] < this.width() &&
            e.touchPos[1] >= 0 && e.touchPos[1] < this.height()) {
            let record = null;
            let index = 0;
            let runningNumber = 0;
            this.elementsPositions.forEach(el => {
                el.element.deactivate();
                el.element.refresh();
                if (e.touchPos[0] >= el.x && e.touchPos[0] < el.x + el.element.width() &&
                    e.touchPos[1] >= el.y && e.touchPos[1] < el.y + el.element.height()) {
                    record = el;
                    index = runningNumber;
                }
                runningNumber++;
            });
            if (record) {
                e.preventDefault();
                if (type !== "touchmove")
                    record.element.activate();
                e.translateEvent(e, -record.x, -record.y);
                record.element.handleTouchEvents(type, e);
                e.translateEvent(e, record.x, record.y);
                record.element.refresh();
                this.elementTouched = record;
                if (e.repaint) {
                    this.refreshCanvas();
                }
                this.lastTouched = index;
            }
        }
        if (this.elementTouched) {
            e.preventDefault();
            if (type !== "touchmove")
                this.elementTouched.element.activate();
            e.translateEvent(e, -this.elementTouched.x, -this.elementTouched.y);
            this.elementTouched.element.handleTouchEvents(type, e);
            e.translateEvent(e, this.elementTouched.x, this.elementTouched.y);
            this.elementTouched.element.refresh();
            if (e.repaint) {
                this.refreshCanvas();
            }
        }
        if (type === "touchend")
            this.elementTouched = null;
    }
    refresh() {
        this.refreshMetaData();
        this.refreshCanvas();
    }
    deactivate() {
        this.focused = false;
        this.elements.forEach(el => {
            el.deactivate();
        });
    }
    activate() {
        this.focused = true;
    }
    isCellFree(x, y) {
        const pixelX = x * this.pixelDim[0] / this.matrixDim[0];
        const pixelY = y * this.pixelDim[1] / this.matrixDim[1];
        let free = true;
        if (pixelX < this.pixelDim[0] && pixelY < this.pixelDim[1])
            for (let i = 0; free && i < this.elementsPositions.length; i++) {
                const elPos = this.elementsPositions[i];
                if (elPos.x <= pixelX && elPos.x + elPos.width > pixelX &&
                    elPos.y <= pixelY && elPos.y + elPos.height > pixelY)
                    free = false;
            }
        else
            free = false;
        return free;
    }
    refreshMetaData(xPos = 0, yPos = 0, offsetX = 0, offsetY = 0) {
        this.elementsPositions.splice(0, this.elementsPositions.length);
        const width = this.columnWidth();
        const height = this.rowHeight();
        let counter = new LexicoGraphicNumericPair(this.matrixDim[0]);
        let matX = 0;
        let matY = 0;
        for (let i = 0; i < this.elements.length; i++) {
            const element = this.elements[i];
            const elementWidth = Math.ceil(element.width() / this.columnWidth());
            let clearSpace = true;
            do {
                let j = counter.second;
                clearSpace = true;
                for (; clearSpace && j < counter.second + elementWidth; j++) {
                    clearSpace = this.isCellFree(j, counter.first);
                }
                if (!clearSpace && j < elementWidth) {
                    counter.incLower(j - counter.second);
                }
                else if (!clearSpace && j >= elementWidth) {
                    counter.incHigher();
                    counter.second = 0;
                }
            } while (!clearSpace && counter.first < this.matrixDim[1]);
            const x = counter.second * this.columnWidth();
            const y = counter.first * this.rowHeight();
            counter.second += elementWidth;
            const record = new RowRecord(x + xPos + offsetX, y + yPos + offsetY, element.width(), element.height(), element);
            this.elementsPositions.push(record);
        }
    }
    refreshCanvas(ctx = this.ctx, x = 0, y = 0) {
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.elementsPositions.forEach(el => el.element.draw(ctx, el.x, el.y, x, y));
    }
    active() {
        return this.focused;
    }
    width() {
        return this.pixelDim[0];
    }
    setWidth(val) {
        this.pixelDim[0] = val;
        this.canvas.width = val;
    }
    height() {
        return this.pixelDim[1];
    }
    setHeight(val) {
        this.pixelDim[1] = val;
        this.canvas.height = val;
    }
    rowHeight() {
        return this.pixelDim[1] / this.matrixDim[1];
    }
    columnWidth() {
        return this.pixelDim[0] / this.matrixDim[0];
    }
    usedRows() {
        for (let i = 0; i < this.elements.length; i++) {
        }
        return this.elements.length - 1;
    }
    hasSpace(element) {
        const elWidth = Math.floor((element.width() / this.columnWidth()) * this.matrixDim[0]);
        const elHeight = Math.floor((element.height() / this.rowHeight()) * this.matrixDim[1]);
        if (this.elements.length) {
            //todo
        }
        //todo
        return false;
    }
    addElement(element, position = -1) {
        let inserted = false;
        if (position === -1) {
            this.elements.push(element);
        }
        else {
            this.elements.splice(position, 0, element);
        }
        this.refreshMetaData();
        this.refreshCanvas();
        return inserted;
    }
    removeElement(element) {
        this.elements.splice(this.elements.indexOf(element), 1);
        this.refreshMetaData();
        this.refreshCanvas();
    }
    elementPosition(element) {
        const elPos = this.elementsPositions.find((el) => el.element === element);
        if (elPos === undefined)
            return [-1, -1];
        return [elPos.x, elPos.y];
    }
    draw(ctx, xPos = this.x, yPos = this.y, offsetX = 0, offsetY = 0) {
        this.refreshCanvas();
        ctx.drawImage(this.canvas, xPos + offsetX, yPos + offsetY);
    }
}
;
class ScrollingGridLayoutManager extends SimpleGridLayoutManager {
    constructor(matrixDim, pixelDim, x = 0, y = 0) {
        super(matrixDim, pixelDim, x, y);
        this.scrolledCanvas = document.createElement("canvas");
        this.offset = [0, 0];
    }
    handleScrollEvent(event) {
    }
    refreshCanvas() {
        super.refreshCanvas();
    }
}
;
class GuiListItem extends SimpleGridLayoutManager {
    constructor(text, state, pixelDim, fontSize = 16, callBack = () => { }, genericCallBack = null, slideMoved = null, flags = GuiTextBox.bottom, genericTouchType = "touchend") {
        super([20, 1], pixelDim);
        this.callBackType = genericTouchType;
        this.callBack = genericCallBack;
        this.checkBox = new GuiCheckBox(callBack, pixelDim[1], pixelDim[1], state);
        const width = (pixelDim[0] - fontSize * 2 - 10) >> (slideMoved ? 1 : 0);
        this.textBox = new GuiTextBox(false, width, null, fontSize, pixelDim[1], flags);
        this.textBox.setText(text);
        this.addElement(this.checkBox);
        this.addElement(this.textBox);
        if (slideMoved) {
            this.slider = new GuiSlider(1, [width, pixelDim[1]], slideMoved);
            this.sliderX = width + pixelDim[1];
            this.addElement(this.slider);
        }
        else {
            this.slider = null;
            this.sliderX = -1;
        }
    }
    handleTouchEvents(type, e) {
        super.handleTouchEvents(type, e);
        if (this.active() && type === this.callBackType) {
            e.item = this;
            if (this.callBack)
                this.callBack(e);
        }
    }
    state() {
        return this.checkBox.checked;
    }
}
;
class SlideEvent {
    constructor(value, element) {
        this.value = value;
        this.element = element;
    }
}
class GuiCheckList {
    constructor(matrixDim, pixelDim, fontSize, uniqueSelection, swap = null, slideMoved = null) {
        this.focused = true;
        this.uniqueSelection = uniqueSelection;
        this.fontSize = fontSize;
        this.layoutManager = new SimpleGridLayoutManager([1, matrixDim[1]], pixelDim);
        this.list = [];
        this.limit = 0;
        this.dragItem = null;
        this.dragItemLocation = [-1, -1];
        this.dragItemInitialIndex = -1;
        this.slideMoved = slideMoved;
        this.swapElementsInParallelArray = swap;
    }
    push(text, state = true, checkBoxCallback, onClickGeneral) {
        const newElement = new GuiListItem(text, state, [this.width(),
            this.height() / this.layoutManager.matrixDim[1] - 5], this.fontSize, checkBoxCallback, onClickGeneral, this.slideMoved);
        this.list.push(newElement);
    }
    selected() {
        return this.layoutManager.lastTouched;
    }
    selectedItem() {
        if (this.selected() !== -1)
            return this.list[this.selected()];
        else
            return null;
    }
    findBasedOnCheckbox(checkBox) {
        let index = 0;
        for (; index < this.list.length; index++) {
            if (this.list[index].checkBox === checkBox)
                break;
        }
        return index;
    }
    get(index) {
        if (this.list[index])
            return this.list[index];
        else
            return null;
    }
    isChecked(index) {
        return this.list[index] ? this.list[index].checkBox.checked : false;
    }
    delete(index) {
        if (this.list[index]) {
            this.list.splice(index, 1);
            this.refresh();
        }
    }
    active() {
        return this.focused;
    }
    deactivate() {
        this.focused = false;
    }
    activate() {
        this.focused = true;
    }
    width() {
        return this.layoutManager.width();
    }
    height() {
        return this.layoutManager.height();
    }
    refresh() {
        this.layoutManager.elements = this.list;
        this.layoutManager.refresh();
    }
    draw(ctx, x, y, offsetX, offsetY) {
        //this.layoutManager.draw(ctx, x, y, offsetX, offsetY);
        const itemsPositions = this.layoutManager.elementsPositions;
        let offsetI = 0;
        for (let i = 0; i < itemsPositions.length; i++) {
            if (this.dragItem && this.dragItemLocation[1] !== -1 && i === Math.floor((this.dragItemLocation[1] / this.height()) * this.layoutManager.matrixDim[1])) {
                offsetI++;
            }
            this.list[i].draw(ctx, x, y + offsetI * (this.height() / this.layoutManager.matrixDim[1]), offsetX, offsetY);
            offsetI++;
        }
        if (this.dragItem)
            this.dragItem.draw(ctx, x + this.dragItemLocation[0] - this.dragItem.width() / 2, y + this.dragItemLocation[1] - this.dragItem.height() / 2, offsetX, offsetY);
    }
    handleKeyBoardEvents(type, e) {
        this.layoutManager.handleKeyBoardEvents(type, e);
    }
    handleTouchEvents(type, e) {
        let checkedIndex = -1;
        if (this.uniqueSelection) {
            for (let i = 0; i < this.list.length; i++) {
                if (this.list[i].checkBox.checked) {
                    checkedIndex = i;
                }
            }
            ;
            this.layoutManager.handleTouchEvents(type, e);
            for (let i = 0; i < this.list.length; i++) {
                if (this.list[i].checkBox.checked && i !== checkedIndex) {
                    this.list[checkedIndex].checkBox.checked = false;
                    this.list[checkedIndex].checkBox.refresh();
                    break;
                }
            }
        }
        else {
            this.layoutManager.handleTouchEvents(type, e);
        }
        const clicked = Math.floor((e.touchPos[1] / this.height()) * this.layoutManager.matrixDim[1]);
        this.layoutManager.lastTouched = clicked > this.list.length ? this.list.length - 1 : clicked;
        switch (type) {
            case ("touchend"):
                if (this.dragItem) {
                    this.list.splice(clicked, 0, this.dragItem);
                    if (this.swapElementsInParallelArray && this.dragItemInitialIndex !== -1) {
                        if (clicked > this.list.length)
                            this.swapElementsInParallelArray(this.dragItemInitialIndex, this.list.length - 1);
                        else
                            this.swapElementsInParallelArray(this.dragItemInitialIndex, clicked);
                    }
                    this.dragItem = null;
                    this.dragItemInitialIndex = -1;
                    this.dragItemLocation[0] = -1;
                    this.dragItemLocation[1] = -1;
                }
                if (this.selectedItem() && this.selectedItem().callBack)
                    this.selectedItem().callBack(e);
                break;
            case ("touchmove"):
                const movesNeeded = isTouchSupported() ? 7 : 2;
                if (this.selectedItem() && e.touchPos[0] < this.selectedItem().sliderX) {
                    if (e.moveCount === movesNeeded && this.selectedItem() && this.list.length > 1) {
                        this.dragItem = this.list.splice(this.selected(), 1)[0];
                        this.dragItemInitialIndex = this.selected();
                        this.dragItemLocation[0] = e.touchPos[0];
                        this.dragItemLocation[1] = e.touchPos[1];
                    }
                    else if (e.moveCount > movesNeeded) {
                        this.dragItemLocation[0] += e.deltaX;
                        this.dragItemLocation[1] += e.deltaY;
                    }
                }
                else if (e.moveCount > movesNeeded) {
                    this.dragItemLocation[0] += e.deltaX;
                    this.dragItemLocation[1] += e.deltaY;
                }
                break;
        }
    }
    isLayoutManager() {
        return false;
    }
}
;
class GuiSlider {
    constructor(state, dim, movedCallBack) {
        this.state = state;
        this.callBack = movedCallBack;
        this.focused = false;
        this.dim = [dim[0], dim[1]];
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width();
        this.canvas.height = this.height();
        this.refresh();
    }
    setState(value) {
        if (value < 1 && value >= 0)
            this.state = value;
        else if (value >= 1)
            this.state = value;
        this.refresh();
    }
    active() {
        return this.focused;
    }
    deactivate() {
        this.focused = false;
    }
    activate() {
        this.focused = true;
    }
    width() {
        return this.dim[0];
    }
    height() {
        return this.dim[1];
    }
    getBounds() {
        return [this.width() / 10, this.height() / 10, this.width() - this.width() / 5, this.height() - this.height() / 5];
    }
    refresh() {
        const ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.width(), this.height());
        ctx.fillStyle = "#FFFFFF";
        const bounds = this.getBounds();
        const center = [bounds[0] + bounds[2] / 2, bounds[1] + bounds[3] / 2];
        const displayLineX = this.state * bounds[2] + bounds[0];
        ctx.fillRect(bounds[0] - 1, center[1] - 1, bounds[2] + 2, 4);
        ctx.fillRect(displayLineX - 1, bounds[1] - 1, 5 + 1, bounds[3] + 2);
        ctx.fillStyle = "#000000";
        ctx.fillRect(bounds[0], center[1], bounds[2], 2);
        ctx.fillRect(displayLineX, bounds[1], 4, bounds[3]);
    }
    draw(ctx, x, y, offsetX, offsetY) {
        ctx.drawImage(this.canvas, x + offsetX, y + offsetY);
    }
    handleKeyBoardEvents(type, e) {
    }
    handleTouchEvents(type, e) {
        const bounds = [this.width() / 10, this.height() / 10, this.width() - this.width() / 5, this.height() - this.height() / 5];
        switch (type) {
            case ("touchstart"):
                this.state = (e.touchPos[0] - bounds[0]) / bounds[2];
                break;
            case ("touchmove"):
                this.state = (e.touchPos[0] - bounds[0]) / bounds[2];
                break;
        }
        if (this.state > 1)
            this.state = 1;
        else if (this.state < 0)
            this.state = 0;
        if (this.callBack)
            this.callBack({ value: this.state, element: this });
        this.refresh();
    }
    isLayoutManager() {
        return false;
    }
}
;
class GuiSpacer {
    constructor(dim) {
        this.dim = [dim[0], dim[1]];
        this.refresh();
    }
    active() {
        return false;
    }
    deactivate() { }
    activate() { }
    width() {
        return this.dim[0];
    }
    height() {
        return this.dim[1];
    }
    refresh() { }
    draw(ctx, x, y, offsetX, offsetY) { }
    handleKeyBoardEvents(type, e) { }
    handleTouchEvents(type, e) { }
    isLayoutManager() {
        return false;
    }
}
;
class GuiColoredSpacer {
    constructor(dim, color) {
        this.dim = [dim[0], dim[1]];
        this.color = new RGB(0, 0, 0);
        this.color.copy(color);
        this.refresh();
    }
    active() {
        return false;
    }
    deactivate() { }
    activate() { }
    width() {
        return this.dim[0];
    }
    height() {
        return this.dim[1];
    }
    refresh() { }
    draw(ctx, x, y, offsetX, offsetY) {
        const originalFillStyle = ctx.fillStyle;
        const originalStrokeStyle = ctx.strokeStyle;
        const colorString = this.color.htmlRBGA();
        if (colorString !== originalFillStyle) {
            ctx.fillStyle = colorString;
        }
        if ("#000000" !== originalStrokeStyle) {
            ctx.strokeStyle = "#000000";
        }
        ctx.fillRect(x + offsetX, y + offsetY, this.dim[0], this.dim[1]);
        ctx.strokeRect(x + offsetX, y + offsetY, this.dim[0], this.dim[1]);
        if (colorString !== originalFillStyle) {
            ctx.fillStyle = originalFillStyle;
        }
        if ("#000000" !== originalStrokeStyle) {
            ctx.strokeStyle = originalStrokeStyle;
        }
    }
    handleKeyBoardEvents(type, e) { }
    handleTouchEvents(type, e) { }
    isLayoutManager() {
        return false;
    }
}
;
class GuiButton {
    constructor(callBack, text, width = 200, height = 50, fontSize = 12, pressedColor = new RGB(150, 150, 200, 255), unPressedColor = new RGB(255, 255, 255, 195), fontName = "button_font") {
        this.text = text;
        this.fontSize = fontSize;
        this.dimensions = [width, height];
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d");
        this.pressedColor = pressedColor;
        this.unPressedColor = unPressedColor;
        this.pressed = false;
        this.focused = true;
        this.callback = callBack;
        this.fontName = fontName;
        //if(document.fonts.check(`16px ${this.fontName}`, "a"))
        {
            this.font = new FontFace(`${this.fontName}`, 'url(/web/fonts/Minecraft.ttf)');
            this.font.load().then((loaded_face) => {
                document.fonts.add(loaded_face);
                this.drawInternal();
            }, (error) => {
                this.font = new FontFace(`${this.fontName}`, 'url(/fonts/Minecraft.ttf)');
                this.font.load().then((loaded_face) => {
                    document.fonts.add(loaded_face);
                    this.drawInternal();
                }, (error) => {
                    console.log(error.message);
                    this.drawInternal();
                });
            });
        }
    }
    handleKeyBoardEvents(type, e) {
        if (this.active()) {
            if (e.code === "Enter") {
                switch (type) {
                    case ("keydown"):
                        this.pressed = true;
                        this.drawInternal();
                        break;
                    case ("keyup"):
                        if (this.callback)
                            this.callback();
                        this.pressed = false;
                        this.drawInternal();
                        this.deactivate();
                        break;
                }
            }
        }
    }
    handleTouchEvents(type, e) {
        if (this.active())
            switch (type) {
                case ("touchstart"):
                    this.pressed = true;
                    this.drawInternal();
                    break;
                case ("touchend"):
                    if (this.callback)
                        this.callback();
                    this.pressed = false;
                    this.drawInternal();
                    break;
            }
    }
    isLayoutManager() {
        return false;
    }
    active() {
        return this.focused;
    }
    deactivate() {
        this.focused = false;
    }
    activate() {
        this.focused = true;
    }
    width() {
        return this.dimensions[0];
    }
    height() {
        return this.dimensions[1];
    }
    setCtxState(ctx) {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        if (this.pressed)
            ctx.fillStyle = this.pressedColor.htmlRBGA();
        else
            ctx.fillStyle = this.unPressedColor.htmlRBGA();
        ctx.font = this.fontSize + `px ${this.fontName}`;
    }
    refresh() {
        this.drawInternal();
    }
    drawInternal(ctx = this.ctx) {
        const fs = ctx.fillStyle;
        this.setCtxState(ctx);
        ctx.fillRect(0, 0, this.width(), this.height());
        ctx.strokeRect(0, 0, this.width(), this.height());
        ctx.fillStyle = "#000000";
        const textWidth = ctx.measureText(this.text).width;
        const textHeight = this.fontSize;
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 4;
        ctx.strokeText(this.text, this.width() / 2 - textWidth / 2, this.height() / 2 + textHeight / 2, this.width());
        ctx.fillText(this.text, this.width() / 2 - textWidth / 2, this.height() / 2 + textHeight / 2, this.width());
        ctx.fillStyle = fs;
    }
    draw(ctx, x, y, offsetX = 0, offsetY = 0) {
        ctx.drawImage(this.canvas, x + offsetX, y + offsetY);
    }
}
;
class GuiCheckBox {
    constructor(callBack, width = 50, height = 50, checked = false, unPressedColor = new RGB(255, 255, 255, 0), pressedColor = new RGB(150, 150, 200, 255), fontSize = height - 10) {
        this.checked = checked;
        this.fontSize = fontSize;
        this.dimensions = [width, height];
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d");
        this.pressedColor = pressedColor;
        this.unPressedColor = unPressedColor;
        this.pressed = false;
        this.focused = true;
        this.callback = callBack;
        this.drawInternal();
    }
    handleKeyBoardEvents(type, e) {
        if (this.active()) {
            if (e.code === "Enter") {
                switch (type) {
                    case ("keydown"):
                        this.pressed = true;
                        this.drawInternal();
                        break;
                    case ("keyup"):
                        e.checkBox = this;
                        if (this.callback)
                            this.callback(e);
                        this.pressed = false;
                        this.drawInternal();
                        this.deactivate();
                        break;
                }
            }
        }
    }
    isLayoutManager() {
        return false;
    }
    handleTouchEvents(type, e) {
        if (this.active())
            switch (type) {
                case ("touchstart"):
                    this.pressed = true;
                    this.drawInternal();
                    break;
                case ("touchend"):
                    this.checked = !this.checked;
                    this.pressed = false;
                    e.checkBox = this;
                    if (this.callback)
                        this.callback(e);
                    this.drawInternal();
                    break;
            }
    }
    active() {
        return this.focused;
    }
    deactivate() {
        this.focused = false;
    }
    activate() {
        this.focused = true;
    }
    width() {
        return this.dimensions[0];
    }
    height() {
        return this.dimensions[1];
    }
    setCtxState(ctx) {
        if (this.pressed)
            ctx.fillStyle = this.pressedColor.htmlRBGA();
        else
            ctx.fillStyle = this.unPressedColor.htmlRBGA();
        ctx.font = this.fontSize + 'px Calibri';
    }
    refresh() {
        this.drawInternal();
    }
    drawInternal(ctx = this.ctx) {
        const fs = ctx.fillStyle;
        this.setCtxState(ctx);
        ctx.clearRect(0, 0, this.width(), this.height());
        ctx.fillRect(0, 0, this.width(), this.height());
        ctx.fillStyle = "#000000";
        ctx.strokeStyle = "#000000";
        ctx.strokeRect(1, 1, this.canvas.width - 2, this.canvas.height - 2);
        ctx.strokeStyle = "#FFFFFF";
        ctx.strokeRect(3, 3, this.canvas.width - 6, this.canvas.height - 6);
        ctx.fillText(this.checked ? "\u2713" : "", this.width() / 2 - this.ctx.measureText("\u2713").width / 2, 0 + this.fontSize, this.width());
        ctx.strokeText(this.checked ? "\u2713" : "", this.width() / 2 - this.ctx.measureText("\u2713").width / 2, 0 + this.fontSize, this.width());
        ctx.fillStyle = fs;
    }
    draw(ctx, x, y, offsetX = 0, offsetY = 0) {
        ctx.drawImage(this.canvas, x + offsetX, y + offsetY);
    }
}
;
class TextRow {
    constructor(text, x, y, width) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.width = width;
    }
}
;
class Optional {
    constructor() {
        this.data = null;
    }
    get() {
        return this.data;
    }
    set(data) {
        this.data = data;
    }
    clear() {
        this.data = null;
    }
}
;
;
class GuiTextBox {
    constructor(keyListener, width, submit = null, fontSize = 16, height = 2 * fontSize, flags = GuiTextBox.default, validationCallback = null, selectedColor = new RGB(80, 80, 220), unSelectedColor = new RGB(100, 100, 100), outline = true, fontName = "textBox_default", customFontFace = null) {
        this.handleKeyEvents = keyListener;
        this.outlineTextBox = outline;
        this.validationCallback = validationCallback;
        GuiTextBox.textBoxRunningNumber++;
        this.textBoxId = GuiTextBox.textBoxRunningNumber;
        this.cursor = 0;
        this.flags = flags;
        this.focused = false;
        this.promptText = "Enter text here:";
        this.submissionButton = submit;
        this.selectedColor = selectedColor;
        this.unSelectedColor = unSelectedColor;
        this.asNumber = new Optional();
        this.text = "";
        this.scroll = [0, 0];
        this.scaledCursorPos = [0, 0];
        this.cursorPos = [0, 0];
        this.rows = [];
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d");
        this.dimensions = [width, height];
        this.fontSize = fontSize;
        this.fontName = fontName;
        {
            if (customFontFace) {
                this.font = customFontFace;
                this.font.family;
            }
            else
                this.font = new FontFace(fontName, 'url(/web/fonts/Minecraft.ttf)');
            this.font.load().then((loaded_face) => {
                document.fonts.add(loaded_face);
                this.drawInternalAndClear();
            }, (error) => {
                this.font = new FontFace(fontName, 'url(/fonts/Minecraft.ttf)');
                this.font.load().then((loaded_face) => {
                    document.fonts.add(loaded_face);
                    this.refresh();
                }, (error) => {
                    console.log(error.message);
                    this.refresh();
                });
            });
        }
    }
    //take scaled pos calc delta from cursor pos
    //
    isLayoutManager() {
        return false;
    }
    hflag() {
        return this.flags & GuiTextBox.horizontalAlignmentFlagsMask;
    }
    hcenter() {
        return this.hflag() === GuiTextBox.hcenter;
    }
    left() {
        return this.hflag() === GuiTextBox.left;
    }
    farleft() {
        return this.hflag() === GuiTextBox.farleft;
    }
    right() {
        return this.hflag() === GuiTextBox.right;
    }
    center() {
        return (this.flags & GuiTextBox.verticalAlignmentFlagsMask) === GuiTextBox.center;
    }
    top() {
        return (this.flags & GuiTextBox.verticalAlignmentFlagsMask) === GuiTextBox.top;
    }
    bottom() {
        return (this.flags & GuiTextBox.verticalAlignmentFlagsMask) === GuiTextBox.bottom;
    }
    handleKeyBoardEvents(type, e) {
        let preventDefault = false;
        if (this.active() && this.handleKeyEvents) {
            preventDefault = true;
            const oldText = this.text;
            const oldCursor = this.cursor;
            switch (type) {
                case ("keydown"):
                    switch (e.code) {
                        case ("NumpadEnter"):
                        case ("Enter"):
                            this.deactivate();
                            if (this.submissionButton) {
                                this.submissionButton.activate();
                                this.submissionButton.handleKeyBoardEvents(type, e);
                            }
                            break;
                        case ("Space"):
                            this.text = this.text.substring(0, this.cursor) + ' ' + this.text.substring(this.cursor, this.text.length);
                            this.cursor++;
                            break;
                        case ("Backspace"):
                            this.text = this.text.substring(0, this.cursor - 1) + this.text.substring(this.cursor, this.text.length);
                            this.cursor -= +(this.cursor > 0);
                            break;
                        case ("Delete"):
                            this.text = this.text.substring(0, this.cursor) + this.text.substring(this.cursor + 1, this.text.length);
                            break;
                        case ("ArrowLeft"):
                            this.cursor -= +(this.cursor > 0);
                            break;
                        case ("ArrowRight"):
                            this.cursor += +(this.cursor < this.text.length);
                            break;
                        case ("ArrowUp"):
                            this.cursor = 0;
                            break;
                        case ("ArrowDown"):
                            this.cursor = (this.text.length);
                            break;
                        case ("Period"):
                            this.text = this.text.substring(0, this.cursor) + "." + this.text.substring(this.cursor, this.text.length);
                            this.cursor++;
                            break;
                        case ("Comma"):
                            this.text = this.text.substring(0, this.cursor) + "," + this.text.substring(this.cursor, this.text.length);
                            this.cursor++;
                            break;
                        default:
                            {
                                let letter = e.code.substring(e.code.length - 1);
                                if (!e.keysHeld["ShiftRight"] && !e.keysHeld["ShiftLeft"])
                                    letter = letter.toLowerCase();
                                if (GuiTextBox.textLookup[e.code] || GuiTextBox.numbers[e.code]) {
                                    this.text = this.text.substring(0, this.cursor) + letter + this.text.substring(this.cursor, this.text.length);
                                    this.cursor++;
                                }
                                else if (GuiTextBox.specialChars[e.code]) {
                                    //todo
                                }
                                else if (e.code.substring(0, "Numpad".length) === "Numpad") {
                                    this.text = this.text.substring(0, this.cursor) + letter + this.text.substring(this.cursor, this.text.length);
                                    this.cursor++;
                                }
                            }
                    }
                    this.calcNumber();
                    if (this.validationCallback) {
                        if (!this.validationCallback({ textbox: this, event: e, oldCursor: oldCursor, oldText: oldText })) {
                            this.text = oldText;
                            this.cursor = oldCursor;
                        }
                        else {
                            this.drawInternalAndClear();
                        }
                    }
                    else {
                        this.drawInternalAndClear();
                    }
            }
        }
        if (preventDefault)
            e.preventDefault();
    }
    setText(text) {
        this.text = text;
        this.cursor = text.length;
        this.calcNumber();
        this.drawInternalAndClear();
    }
    calcNumber() {
        if (!isNaN(Number(this.text))) {
            this.asNumber.set(Number(this.text));
        }
        else
            this.asNumber.clear();
    }
    handleTouchEvents(type, e) {
        if (this.active()) {
            switch (type) {
                case ("touchend"):
                    if (isTouchSupported() && this.handleKeyEvents) {
                        const value = prompt(this.promptText, this.text);
                        if (value) {
                            this.setText(value);
                            this.calcNumber();
                            this.deactivate();
                            if (this.submissionButton) {
                                this.submissionButton.activate();
                                this.submissionButton.callback();
                            }
                        }
                    }
                    this.drawInternalAndClear();
            }
        }
    }
    static initGlobalText() {
        for (let i = 65; i < 65 + 26; i++)
            GuiTextBox.textLookup["Key" + String.fromCharCode(i)] = true;
    }
    ;
    static initGlobalNumbers() {
        for (let i = 48; i < 48 + 10; i++) {
            GuiTextBox.numbers["Digit" + String.fromCharCode(i)] = true;
        }
    }
    ;
    static initGlobalSpecialChars() {
        //specialChars
    }
    active() {
        return this.focused;
    }
    deactivate() {
        this.focused = false;
        this.refresh();
    }
    activate() {
        this.focused = true;
        this.refresh();
    }
    textWidth() {
        return this.ctx.measureText(this.text).width;
    }
    setCtxState() {
        this.ctx.strokeStyle = "#000000";
        this.ctx.font = this.fontSize + `px ${this.fontName}`;
    }
    width() {
        return this.dimensions[0];
    }
    height() {
        return this.dimensions[1];
    }
    refreshMetaData(text = this.text, x = 0, y = this.fontSize, cursorOffset = 0) {
        if (text.search("\n") !== -1) {
            const rows = text.split("\n");
            let indeces = new Pair(cursorOffset, [x, y]);
            rows.forEach(row => {
                indeces = this.refreshMetaData(row, indeces.second[0], indeces.second[1] + this.fontSize, indeces.first);
            });
            return indeces;
        }
        const textWidth = this.ctx.measureText(text).width;
        const canvasWidth = this.canvas.width;
        const rows = Math.ceil(textWidth / (canvasWidth - (20 + x)));
        const charsPerRow = Math.floor(text.length / rows);
        const cursor = this.cursor - cursorOffset;
        let charIndex = 0;
        let i = 0;
        for (; i < rows - 1; i++) {
            const yPos = i * this.fontSize + y;
            if (cursor >= charIndex && cursor <= charIndex + charsPerRow) {
                this.cursorPos[1] = yPos;
                const substrWidth = this.ctx.measureText(text.substring(charIndex, cursor)).width;
                this.cursorPos[0] = substrWidth + x;
            }
            const substr = text.substring(charIndex, charIndex + charsPerRow);
            this.rows.push(new TextRow(substr, x, yPos, this.width() - x));
            charIndex += charsPerRow;
        }
        const yPos = i * this.fontSize + y;
        const substring = text.substring(charIndex, text.length);
        const substrWidth = this.ctx.measureText(substring).width;
        if (substrWidth > this.width() - x)
            this.refreshMetaData(substring, x, i * this.fontSize + y, cursorOffset + charIndex);
        else if (substring.length > 0) {
            if (cursor >= charIndex) {
                this.cursorPos[1] = yPos;
                const substrWidth = this.ctx.measureText(text.substring(charIndex, cursor)).width;
                this.cursorPos[0] = substrWidth + x;
            }
            this.rows.push(new TextRow(substring, x, yPos, this.width() - x));
        }
        return new Pair(cursorOffset + charIndex, [x, i * this.fontSize + y]);
    }
    cursorRowIndex() {
        let index = 0;
        for (let i = 0; i < this.rows.length; i++) {
            const row = this.rows[i];
            if (row.y === Math.floor(this.cursor / this.fontSize))
                index = i;
        }
        return index;
    }
    adjustScrollToCursor() {
        let deltaY = 0;
        let deltaX = 0;
        if (this.top()) {
            if (this.cursorPos[1] > this.height() - this.fontSize) {
                deltaY += this.cursorPos[1] - this.fontSize;
            }
            else if (this.cursorPos[1] < this.fontSize) {
                deltaY -= this.cursorPos[1] + this.fontSize;
            }
        }
        else if (this.center()) {
            if (this.cursorPos[1] > this.height() / 2 + this.fontSize / 2) {
                deltaY += this.cursorPos[1] - this.height() + this.height() / 2;
            }
            else if (this.cursorPos[1] < this.height() / 2 + this.fontSize / 2) {
                deltaY += this.cursorPos[1] - (this.height() / 2);
            }
        }
        else {
            if (this.cursorPos[1] > this.height() - 3) {
                deltaY += this.cursorPos[1] - this.height() + this.fontSize / 3;
            }
            else if (this.cursorPos[1] < this.height() - 3) {
                deltaY += this.cursorPos[1] - this.height() + this.fontSize / 3;
            }
        }
        if (this.rows.length) {
            let freeSpace = this.width(); // - this.rows[0].width;
            let maxWidth = 0;
            this.rows.forEach(el => {
                const width = this.ctx.measureText(el.text).width;
                if (freeSpace > this.width() - width) {
                    freeSpace = this.width() - width;
                    maxWidth = width;
                }
            });
            if (this.hcenter()) {
                deltaX -= freeSpace / 2 - maxWidth / 2;
            }
            else if (this.left()) {
                deltaX -= this.ctx.measureText("0").width / 3;
            }
            else if (this.right()) {
                deltaX -= freeSpace + this.ctx.measureText("0").width / 3;
            }
        }
        const newRows = [];
        this.rows.forEach(row => newRows.push(new TextRow(row.text, row.x - deltaX, row.y - deltaY, row.width)));
        this.scaledCursorPos[1] = this.cursorPos[1] - deltaY;
        this.scaledCursorPos[0] = this.cursorPos[0] - deltaX;
        return newRows;
    }
    drawRows(rows) {
        rows.forEach(row => {
            this.ctx.lineWidth = 4;
            this.ctx.strokeText(row.text, row.x, row.y, row.width);
            this.ctx.fillText(row.text, row.x, row.y, row.width);
        });
    }
    drawCursor() {
        if (this.active() && this.handleKeyEvents) {
            this.ctx.fillStyle = "#000000";
            this.ctx.fillRect(this.scaledCursorPos[0], this.scaledCursorPos[1] - this.fontSize + 3, 2, this.fontSize - 2);
        }
    }
    color() {
        if (this.active())
            return this.selectedColor;
        else
            return this.unSelectedColor;
    }
    refresh() {
        this.drawInternalAndClear();
    }
    drawInternalAndClear() {
        this.setCtxState();
        this.ctx.clearRect(0, 0, this.width(), this.height());
        this.ctx.fillStyle = "#000000";
        this.rows.splice(0, this.rows.length);
        this.refreshMetaData();
        this.ctx.strokeStyle = "#FFFFFF";
        this.drawRows(this.adjustScrollToCursor());
        this.drawCursor();
        if (this.outlineTextBox) {
            this.ctx.strokeStyle = this.color().htmlRBG();
            this.ctx.lineWidth = 4;
            this.ctx.strokeRect(0, 0, this.width(), this.height());
        }
    }
    draw(ctx, x, y, offsetX = 0, offsetY = 0) {
        ctx.drawImage(this.canvas, x + offsetX, y + offsetY);
    }
}
GuiTextBox.center = 0;
GuiTextBox.bottom = 1;
GuiTextBox.top = 2;
GuiTextBox.verticalAlignmentFlagsMask = 0b0011;
GuiTextBox.left = 0;
GuiTextBox.hcenter = (1 << 2);
GuiTextBox.right = (2 << 2);
GuiTextBox.farleft = (3 << 2);
GuiTextBox.horizontalAlignmentFlagsMask = 0b1100;
GuiTextBox.default = GuiTextBox.center | GuiTextBox.left;
GuiTextBox.textLookup = {};
GuiTextBox.numbers = {};
GuiTextBox.specialChars = {};
GuiTextBox.textBoxRunningNumber = 0;
;
class GuiLabel extends GuiTextBox {
    constructor(text, width, fontSize = 16, flags = GuiTextBox.bottom, height = 2 * fontSize, backgroundColor = new RGB(255, 255, 255, 0)) {
        super(false, width, null, fontSize, height, flags, null, backgroundColor, backgroundColor, false);
        this.setText(text);
    }
    //override the textbox's handlers
    handleKeyBoardEvents(type, e) { }
    handleTouchEvents(type, e) { }
    active() {
        return false;
    }
}
;
class GuiRadioGroup {
    constructor(pixelDim, matrixDim) {
        this.layout = new SimpleGridLayoutManager(matrixDim, pixelDim, 0, 0);
    }
    active() {
        return this.layout.active();
    }
    deactivate() {
        this.layout.deactivate();
    }
    activate() {
        this.layout.activate();
    }
    width() {
        return this.layout.width();
    }
    height() {
        return this.layout.height();
    }
    refresh() {
        this.layout.refresh();
    }
    draw(ctx, x, y, offsetX, offsetY) {
        this.layout.draw(ctx, x, y, offsetX, offsetY);
    }
    handleKeyBoardEvents(type, e) {
        this.layout.handleKeyBoardEvents(type, e);
    }
    handleTouchEvents(type, e) {
        this.layout.handleTouchEvents(type, e);
    }
    isLayoutManager() {
        return false;
    }
}
GuiTextBox.initGlobalText();
GuiTextBox.initGlobalNumbers();
GuiTextBox.initGlobalSpecialChars();
class GuiToolBar {
    constructor(renderDim, tools = []) {
        this.focused = false;
        this.selected = 0;
        this.vertical = true;
        this.toolsPerRow = 10;
        this.toolRenderDim = [renderDim[0], renderDim[1]];
        this.tools = tools;
        this.canvas = document.createElement("canvas");
        this.canvas.height = this.height();
        this.canvas.width = this.width();
        this.ctx = this.canvas.getContext("2d");
        this.ctx.strokeStyle = "#000000";
    }
    setImagesIndex(value) {
        this.tools.forEach(tool => {
            if (tool.toolImages.length > value)
                tool.selected = value;
        });
    }
    resize(width = this.width(), height = this.height()) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.strokeStyle = "#000000";
    }
    active() {
        return this.focused;
    }
    deactivate() {
        this.focused = false;
    }
    activate() {
        this.focused = true;
    }
    width() {
        if (this.vertical)
            return this.toolRenderDim[0] * (1 + Math.floor(this.tools.length / this.toolsPerRow));
        else
            return this.toolRenderDim[0] * this.toolsPerRow;
    }
    height() {
        if (this.vertical)
            return this.toolRenderDim[1] * this.toolsPerRow;
        else
            return this.toolRenderDim[1] * (1 + Math.floor(this.tools.length / this.toolsPerRow));
    }
    refresh() {
        this.ctx.clearRect(0, 0, this.width(), this.height());
        for (let i = 0; i < this.tools.length; i++) {
            let gridX = 0;
            let gridY = 0;
            if (this.vertical) {
                const toolsPerColumn = this.toolsPerRow;
                gridX = Math.floor(i / toolsPerColumn);
                gridY = i % toolsPerColumn;
            }
            else {
                gridX = i % this.toolsPerRow;
                gridY = Math.floor(i / this.toolsPerRow);
            }
            const pixelX = gridX * this.toolRenderDim[0];
            const pixelY = gridY * this.toolRenderDim[1];
            const image = this.tools[i].image();
            if (image && image.width && image.height) {
                this.ctx.drawImage(image, pixelX, pixelY, this.toolRenderDim[0], this.toolRenderDim[1]);
            }
            if (this.selected === i) {
                this.ctx.strokeStyle = "#FFFFFF";
                this.ctx.strokeRect(pixelX + 3, pixelY + 3, this.toolRenderDim[0] - 6, this.toolRenderDim[1] - 6);
                this.ctx.strokeStyle = "#000000";
                this.ctx.strokeRect(pixelX + 1, pixelY + 1, this.toolRenderDim[0] - 2, this.toolRenderDim[1] - 2);
            }
        }
    }
    draw(ctx, x, y, offsetX = 0, offsetY = 0) {
        ctx.drawImage(this.canvas, x + offsetX, y + offsetY);
    }
    handleKeyBoardEvents(type, e) { }
    tool() {
        return this.tools[this.selected];
    }
    handleTouchEvents(type, e) {
        if (this.active()) {
            switch (type) {
                case ("touchstart"):
                    const x = Math.floor(e.touchPos[0] / this.toolRenderDim[0]);
                    const y = Math.floor(e.touchPos[1] / this.toolRenderDim[1]);
                    const clicked = this.vertical ? y + x * this.toolsPerRow : x + y * this.toolsPerRow;
                    if (clicked >= 0 && clicked < this.tools.length) {
                        this.selected = clicked;
                    }
            }
            this.refresh();
        }
    }
    isLayoutManager() {
        return false;
    }
}
;
;
class RGB24BitPalette {
    constructor() {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.colorData = null;
        this.refresh();
    }
    refresh() {
        this.colorData = new Int32Array(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data.buffer);
    }
    getColorAt(x, y) {
        return new RGB(0, 0, 0);
    }
    draw(ctx, x, y, width, height) {
    }
}
;
class ToolBarItem {
    constructor(toolName, toolImagePath, selected = 0) {
        this.selected = selected;
        this.toolImages = [];
        if (Array.isArray(toolName) && !(toolImagePath instanceof String) && toolName.length === toolImagePath.length) {
            for (let i = 0; i < toolName.length; i++)
                this.toolImages.push(new ImageContainer(toolName[i], toolImagePath[i]));
        }
        else if (!Array.isArray(toolName) && Array.isArray(toolImagePath)) {
            for (let i = 0; i < toolName.length; i++)
                this.toolImages.push(new ImageContainer(toolName, toolImagePath[i]));
        }
        else if (Array.isArray(toolName) && Array.isArray(toolImagePath) && toolName.length !== toolImagePath.length)
            throw new Error("Invalid params for toolbar item both lists must be same length");
        else if (!Array.isArray(toolName) && !Array.isArray(toolImagePath)) {
            this.toolImages.push(new ImageContainer(toolName, toolImagePath));
        }
        else if (!(toolName instanceof String) && (toolImagePath instanceof String)) {
            throw new Error("Invalid params for toolbar item both params should be same type");
        }
    }
    imageContainer() {
        return this.toolImages[this.selected];
    }
    width() {
        return this.imageContainer().image.width;
    }
    height() {
        return this.imageContainer().image.height;
    }
    image() {
        if (this.imageContainer())
            return this.imageContainer().image;
        return null;
    }
    name() {
        return this.imageContainer().name;
    }
    drawImage(ctx, x, y, width, height) {
        if (this.image()) {
            ctx.drawImage(this.image(), x, y, width, height);
        }
    }
}
;
class Tool extends ToolBarItem {
    constructor(toolName, toolImagePath) {
        super(toolName, toolImagePath);
    }
}
;
class ViewLayoutTool extends Tool {
    constructor(layoutManager, name, path) {
        super(name, path);
        this.layoutManager = layoutManager;
    }
    activateOptionPanel() { this.layoutManager.activate(); }
    deactivateOptionPanel() { this.layoutManager.deactivate(); }
    getOptionPanel() {
        return this.layoutManager;
    }
    optionPanelSize() {
        return [this.layoutManager.canvas.width, this.layoutManager.canvas.height];
    }
    drawOptionPanel(ctx, x, y) {
        const optionPanel = this.getOptionPanel();
        optionPanel.x = x;
        optionPanel.y = y;
        optionPanel.draw(ctx, x, y);
    }
}
;
class GenericTool extends Tool {
    constructor(name, imagePath) {
        super(name, imagePath);
    }
    activateOptionPanel() { }
    deactivateOptionPanel() { }
    getOptionPanel() {
        return null;
    }
    optionPanelSize() {
        return [0, 0];
    }
    drawOptionPanel(ctx, x, y) { }
}
;
class ExtendedTool extends ViewLayoutTool {
    constructor(name, path, optionPanes, dim, matrixDim = [24, 24], parentMatrixDim = [24, 48]) {
        super(new SimpleGridLayoutManager([parentMatrixDim[0], parentMatrixDim[1]], [dim[0], dim[1]]), name, path);
        this.localLayout = new SimpleGridLayoutManager([matrixDim[0], matrixDim[1]], [dim[0], dim[1]]);
        const parentPanel = this.getOptionPanel();
        parentPanel.addElement(this.localLayout);
        this.optionPanels = [this.localLayout];
        let maxY = this.localLayout.height();
        let maxX = this.localLayout.width();
        optionPanes.forEach((pane) => {
            parentPanel.addElement(pane);
            this.optionPanels.push(pane);
            maxY += pane.height();
        });
        parentPanel.setHeight(maxY);
        parentPanel.setWidth(maxX);
        parentPanel.refreshMetaData();
        maxY = 0;
        parentPanel.elementsPositions.forEach(el => {
            if (el.y + el.height > maxY) {
                maxY = el.y + el.height;
            }
        });
        parentPanel.setWidth(maxX);
        parentPanel.setHeight(dim[1] + maxY);
        parentPanel.refreshMetaData();
    }
    activateOptionPanel() {
        this.getOptionPanel().activate();
        this.optionPanels.forEach(element => {
            element.activate();
        });
    }
    deactivateOptionPanel() {
        this.getOptionPanel().deactivate();
        this.optionPanels.forEach(element => {
            element.deactivate();
        });
    }
}
;
class SingleCheckBoxTool extends GenericTool {
    constructor(label, name, imagePath, callback = () => null) {
        super(name, imagePath);
        this.optionPanel = new SimpleGridLayoutManager([1, 4], [200, 90]);
        this.checkBox = new GuiCheckBox(callback, 40, 40);
        this.optionPanel.addElement(new GuiLabel(label, 200, 16, GuiTextBox.bottom, 40));
        this.optionPanel.addElement(this.checkBox);
    }
    activateOptionPanel() { this.optionPanel.activate(); }
    deactivateOptionPanel() { this.optionPanel.deactivate(); }
    getOptionPanel() {
        return this.optionPanel;
    }
    optionPanelSize() {
        return [this.optionPanel.width(), this.optionPanel.height()];
    }
    drawOptionPanel(ctx, x, y) {
        const optionPanel = this.getOptionPanel();
        optionPanel.x = x;
        optionPanel.y = y;
        optionPanel.draw(ctx, x, y);
    }
}
;
class DrawingScreenState {
    constructor(lineWidth) {
        this.drawCacheMap = new Set();
        this.color = new RGB(0, 0, 0);
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
        this.selectionRect = [0, 0, 0, 0];
        this.pasteRect = [0, 0, 0, 0];
        this.selectionSelectionRect = [0, 0, 0, 0];
        this.lineWidth = lineWidth; //dimensions[0] / bounds[0] * 4;
        this.pixelPerfectBuffer = [];
    }
}
;
class DetailedPixelsGroup {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.colors = [];
        this.topLeftPoints = [];
        this.bottomLeftPoints = [];
        this.topRightPoints = [];
        this.bottomRightPoints = [];
    }
    push(color, topLeftX, topLeftY, bottomLeftX, bottomLeftY, topRightX, topRightY, bottomRightX, bottomRightY) {
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
    pushSimple(color, topLeftX, topLeftY, bottomLeftX) {
        this.colors.push(color);
        this.topLeftPoints.push(topLeftX);
        this.topLeftPoints.push(topLeftY);
    }
    clearLists() {
        this.colors = [];
        this.topLeftPoints = [];
        this.bottomLeftPoints = [];
        this.topRightPoints = [];
        this.bottomRightPoints = [];
    }
    resetState() {
        this.x = -1;
        this.y = -1;
        this.clearLists();
    }
}
class ZoomState {
    constructor() {
        this.zoomX = 1;
        this.zoomY = 1;
        this.miniMapRect = [0, 0, 150, 150];
        this.zoomedX = 0;
        this.zoomedY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }
    invZoomX(x) {
        return (1 / (this.zoomX)) * (x - this.zoomedX);
    }
    invZoomY(y) {
        return (1 / (this.zoomY)) * (y - this.zoomedY);
    }
    invJustZoomX(x) {
        return (1 / (this.zoomX)) * (x);
    }
    invJustZoomY(y) {
        return (1 / (this.zoomY)) * (y);
    }
}
;
;
class KeyListenerTypes {
    constructor() {
        this.keydown = new Array();
        this.keypressed = new Array();
        this.keyup = new Array();
    }
}
;
class KeyboardHandler {
    constructor() {
        this.keysHeld = {};
        this.listenerTypeMap = new KeyListenerTypes();
        document.addEventListener("keyup", (e) => this.keyUp(e));
        document.addEventListener("keydown", (e) => this.keyDown(e));
        document.addEventListener("keypressed", (e) => this.keyPressed(e));
    }
    registerCallBack(listenerType, predicate, callBack) {
        this.listenerTypeMap[listenerType].push(new TouchHandler(predicate, callBack));
    }
    callHandler(type, event) {
        const handlers = this.listenerTypeMap[type];
        handlers.forEach((handler) => {
            if (handler.pred(event)) {
                handler.callBack(event);
            }
        });
    }
    keyDown(event) {
        if (this.keysHeld[event.code] === undefined || this.keysHeld[event.code] === null)
            this.keysHeld[event.code] = 1;
        else
            this.keysHeld[event.code]++;
        event.keysHeld = this.keysHeld;
        this.callHandler("keydown", event);
    }
    keyUp(event) {
        this.keysHeld[event.code] = 0;
        event.keysHeld = this.keysHeld;
        this.callHandler("keyup", event);
    }
    keyPressed(event) {
        event.keysHeld = this.keysHeld;
        this.callHandler("keypressed", event);
    }
}
;
class TouchHandler {
    constructor(pred, callBack) {
        this.pred = pred;
        this.callBack = callBack;
    }
}
;
class ListenerTypes {
    constructor() {
        this.touchstart = new Array();
        this.touchmove = new Array();
        this.touchend = new Array();
    }
}
;
;
function isTouchSupported() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0));
}
class MouseDownTracker {
    constructor() {
        const component = document;
        this.mouseDown = false;
        this.count = null;
        if (isTouchSupported()) {
            this.count = 0;
            component.addEventListener('touchstart', event => { this.mouseDown = true; this.count++; }, false);
            component.addEventListener('touchend', event => { this.mouseDown = false; this.count--; }, false);
        }
        if (!isTouchSupported()) {
            component.addEventListener('mousedown', event => this.mouseDown = true);
            component.addEventListener('mouseup', event => this.mouseDown = false);
        }
    }
    getTouchCount() { return this.count; }
}
class SingleTouchListener {
    constructor(component, preventDefault, mouseEmulation, stopRightClick = false) {
        this.lastTouchTime = Date.now();
        this.offset = [];
        this.moveCount = 0;
        this.touchMoveEvents = [];
        this.translateEvent = (e, dx, dy) => e.touchPos = [e.touchPos[0] + dx, e.touchPos[1] + dy];
        this.scaleEvent = (e, dx, dy) => e.touchPos = [e.touchPos[0] * dx, e.touchPos[1] * dy];
        this.startTouchPos = [0, 0];
        this.component = component;
        this.preventDefault = preventDefault;
        this.touchStart = null;
        this.registeredTouch = false;
        this.touchPos = [0, 0];
        this.touchVelocity = 0;
        this.touchMoveCount = 0;
        this.deltaTouchPos = 0;
        this.listenerTypeMap = {
            touchstart: [],
            touchmove: [],
            touchend: []
        };
        this.mouseOverElement = false;
        if (component) {
            if (isTouchSupported()) {
                component.addEventListener('touchstart', (event) => { this.touchStartHandler(event); }, false);
                component.addEventListener('touchmove', (event) => this.touchMoveHandler(event), false);
                component.addEventListener('touchend', (event) => this.touchEndHandler(event), false);
            }
            if (mouseEmulation && !isTouchSupported()) {
                if (stopRightClick)
                    component.addEventListener("contextmenu", (e) => {
                        e.preventDefault();
                        return false;
                    });
                component.addEventListener("mouseover", (event) => { this.mouseOverElement = true; });
                component.addEventListener("mouseleave", (event) => { this.mouseOverElement = false; });
                component.addEventListener('mousedown', (event) => { event.changedTouches = {}; event.changedTouches.item = (x) => event; this.touchStartHandler(event); });
                component.addEventListener('mousemove', (event) => {
                    event.changedTouches = {};
                    event.changedTouches.item = (x) => event;
                    this.touchMoveHandler(event);
                });
                component.addEventListener('mouseup', (event) => { event.changedTouches = {}; event.changedTouches.item = (x) => event; this.touchEndHandler(event); });
            }
        }
    }
    registerCallBack(listenerType, predicate, callBack) {
        this.listenerTypeMap[listenerType].push(new TouchHandler(predicate, callBack));
    }
    callHandler(type, event) {
        const handlers = this.listenerTypeMap[type];
        const touchSupported = isTouchSupported();
        if (SingleTouchListener.mouseDown.getTouchCount() < 2)
            handlers.forEach((handler) => {
                if ((!event.defaultPrevented || touchSupported) && handler.pred(event)) {
                    handler.callBack(event);
                }
            });
    }
    touchStartHandler(event) {
        this.registeredTouch = true;
        this.moveCount = 0;
        event.timeSinceLastTouch = Date.now() - (this.lastTouchTime ? this.lastTouchTime : 0);
        this.lastTouchTime = Date.now();
        this.touchStart = event.changedTouches.item(0);
        this.touchPos = [this.touchStart["offsetX"], this.touchStart["offsetY"]];
        if (!this.touchPos[0]) {
            this.touchPos = [this.touchStart["clientX"] - this.component.getBoundingClientRect().left, this.touchStart["clientY"] - this.component.getBoundingClientRect().top];
        }
        this.startTouchPos = [this.touchPos[0], this.touchPos[1]];
        event.touchPos = this.touchPos ? [this.touchPos[0], this.touchPos[1]] : [0, 0];
        event.translateEvent = this.translateEvent;
        event.scaleEvent = this.scaleEvent;
        this.touchMoveEvents = [];
        this.touchVelocity = 0;
        this.touchMoveCount = 0;
        this.deltaTouchPos = 0;
        this.callHandler("touchstart", event);
        if (this.preventDefault)
            event.preventDefault();
    }
    touchMoveHandler(event) {
        if (this.registeredTouch !== SingleTouchListener.mouseDown.mouseDown) {
            this.touchEndHandler(event);
        }
        let touchMove = event.changedTouches.item(0);
        for (let i = 0; i < event.changedTouches["length"]; i++) {
            if (event.changedTouches.item(i).identifier == this.touchStart.identifier) {
                touchMove = event.changedTouches.item(i);
            }
        }
        if (touchMove) {
            try {
                if (!touchMove["offsetY"]) {
                    touchMove.offsetY = touchMove["clientY"] - this.component.getBoundingClientRect().top;
                }
                if (!touchMove["offsetX"]) {
                    touchMove.offsetX = touchMove["clientX"] - this.component.getBoundingClientRect().left;
                }
            }
            catch (error) {
                console.log(error);
            }
            const deltaY = touchMove["offsetY"] - this.touchPos[1];
            const deltaX = touchMove["offsetX"] - this.touchPos[0];
            this.touchPos[1] += deltaY;
            this.touchPos[0] += deltaX;
            if (!this.registeredTouch)
                return false;
            ++this.moveCount;
            const mag = this.mag([deltaX, deltaY]);
            this.touchMoveCount++;
            this.deltaTouchPos += Math.abs(mag);
            this.touchVelocity = 100 * this.deltaTouchPos / (Date.now() - this.lastTouchTime);
            const a = this.normalize([deltaX, deltaY]);
            const b = [1, 0];
            const dotProduct = this.dotProduct(a, b);
            const angle = Math.acos(dotProduct) * (180 / Math.PI) * (deltaY < 0 ? 1 : -1);
            event.deltaX = deltaX;
            event.startTouchPos = this.startTouchPos;
            event.deltaY = deltaY;
            event.mag = mag;
            event.angle = angle;
            event.avgVelocity = this.touchVelocity;
            event.touchPos = this.touchPos ? [this.touchPos[0], this.touchPos[1]] : [0, 0];
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
    touchEndHandler(event) {
        if (this.registeredTouch) {
            let touchEnd = event.changedTouches.item(0);
            for (let i = 0; i < event.changedTouches["length"]; i++) {
                if (event.changedTouches.item(i).identifier === this.touchStart.identifier) {
                    touchEnd = event.changedTouches.item(i);
                }
            }
            if (touchEnd) {
                if (!touchEnd["offsetY"]) {
                    touchEnd.offsetY = touchEnd["clientY"] - this.component.getBoundingClientRect().top;
                }
                if (!touchEnd["offsetX"]) {
                    touchEnd.offsetX = touchEnd["clientX"] - this.component.getBoundingClientRect().left;
                }
                const deltaY = touchEnd["offsetY"] - this.startTouchPos[1];
                const deltaX = touchEnd["offsetX"] - this.startTouchPos[0];
                this.touchPos = [touchEnd["offsetX"], touchEnd["offsetY"]];
                const mag = this.mag([deltaX, deltaY]);
                const a = this.normalize([deltaX, deltaY]);
                const b = [1, 0];
                const dotProduct = this.dotProduct(a, b);
                const angle = Math.acos(dotProduct) * (180 / Math.PI) * (deltaY < 0 ? 1 : -1);
                const delay = Date.now() - this.lastTouchTime; // from start tap to finish
                this.touchVelocity = 100 * mag / (Date.now() - this.lastTouchTime);
                event.deltaX = deltaX;
                event.deltaY = deltaY;
                event.mag = mag;
                event.angle = angle;
                event.avgVelocity = this.touchVelocity;
                event.touchPos = this.touchPos ? [this.touchPos[0], this.touchPos[1]] : [0, 0];
                event.timeDelayFromStartToEnd = delay;
                event.startTouchTime = this.lastTouchTime;
                event.eventTime = Date.now();
                event.moveCount = this.moveCount;
                event.translateEvent = this.translateEvent;
                event.scaleEvent = this.scaleEvent;
                try {
                    this.callHandler("touchend", event);
                }
                catch (error) {
                    console.log(error);
                    this.registeredTouch = false;
                }
            }
            this.touchMoveEvents = [];
            this.registeredTouch = false;
        }
    }
    mag(a) {
        return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
    }
    normalize(a) {
        const magA = this.mag(a);
        a[0] /= magA;
        a[1] /= magA;
        return a;
    }
    dotProduct(a, b) {
        return a[0] * b[0] + a[1] * b[1];
    }
}
SingleTouchListener.mouseDown = new MouseDownTracker();
;
class MultiTouchListenerTypes {
    constructor() {
        this.pinchIn = [];
        this.pinchOut = [];
    }
}
;
class MultiTouchListener {
    constructor(component) {
        this.lastDistance = 0;
        this.listenerTypeMap = new MultiTouchListenerTypes();
        this.registeredMultiTouchEvent = false;
        if (isTouchSupported()) {
            component.addEventListener('touchmove', event => this.touchMoveHandler(event), false);
            component.addEventListener('touchend', event => { this.registeredMultiTouchEvent = false; event.preventDefault(); }, false);
        }
    }
    registerCallBack(listenerType, predicate, callBack) {
        this.listenerTypeMap[listenerType].push(new TouchHandler(predicate, callBack));
    }
    callHandler(type, event) {
        const handlers = this.listenerTypeMap[type];
        handlers.forEach((handler) => {
            if (!event.defaultPrevented && handler.pred(event)) {
                handler.callBack(event);
            }
        });
    }
    touchMoveHandler(event) {
        const touch1 = event.changedTouches.item(0);
        const touch2 = event.changedTouches.item(1);
        if (SingleTouchListener.mouseDown.getTouchCount() > 1) {
            this.registeredMultiTouchEvent = true;
        }
        if (this.registeredMultiTouchEvent) {
            const newDist = Math.sqrt(Math.pow((touch1.clientX - touch2.clientX), 2) + Math.pow(touch1.clientY - touch2.clientY, 2));
            if (this.lastDistance > newDist) {
                this.callHandler("pinchOut", event);
            }
            else {
                this.callHandler("pinchIn", event);
            }
            event.preventDefault();
            this.lastDistance = newDist;
        }
    }
}
;
class DynamicInt32Array {
    constructor(size = 4096) {
        this.data = new Int32Array(size);
        this.len = 0;
    }
    length() {
        return this.len;
    }
    push(value) {
        if (this.data.length <= this.length()) {
            const temp = new Int32Array(this.data.length * 2);
            for (let i = 0; i < this.data.length; i++) {
                temp[i] = this.data[i];
            }
            this.data = temp;
        }
        this.data[this.len++] = value;
    }
    trimmed() {
        const data = new Int32Array(this.length());
        for (let i = 0; i < data.length; i++)
            data[i] = this.data[i];
        return data;
    }
}
;
function toInt32Array(data) {
    const newData = new Int32Array(data.length);
    for (let i = 0; i < data.length; i++) {
        newData[i] = data[i];
    }
    return newData;
}
function findLeastUsedDoubleWord(buffer) {
    const useCount = new Map();
    for (let i = 0; i < buffer.length; i++) {
        if (useCount.get(buffer[i]))
            useCount.set(buffer[i], useCount.get(buffer[i]) + 1);
        else
            useCount.set(buffer[i], 1);
    }
    let minValue = useCount.values().next().value;
    let minUsedKey = useCount.keys().next().value;
    for (const [key, value] of useCount.entries()) {
        if (value < minValue) {
            minUsedKey = key;
            minValue = value;
        }
    }
    let random = Math.floor(Math.random() * 1000000000);
    for (let i = 0; i < 1000; i++) {
        if (!useCount.get(random))
            break;
        const newRandom = Math.floor(random * Math.random() * (1 + 10 * (i % 2)));
        if (useCount.get(newRandom) < useCount.get(random))
            random = newRandom;
    }
    if (!useCount.get(random) || useCount.get(random) < useCount.get(minUsedKey))
        return random;
    else
        return minUsedKey;
}
function rleEncode(buffer) {
    const flag = findLeastUsedDoubleWord(buffer);
    const data = [];
    data.push(flag);
    for (let i = 0; i < buffer.length;) {
        const value = buffer[i];
        let currentCount = 1;
        while (buffer[i + currentCount] === value)
            currentCount++;
        if (currentCount > 2 || value === flag) {
            data.push(flag);
            data.push(value);
            data.push(currentCount);
            i += currentCount;
        }
        else {
            data.push(value);
            i++;
        }
    }
    return toInt32Array(data);
}
function rleDecode(encodedBuffer) {
    const data = [];
    const flag = encodedBuffer[0];
    for (let i = 1; i < encodedBuffer.length;) {
        if (encodedBuffer[i] !== flag)
            data.push(encodedBuffer[i]);
        else {
            const value = encodedBuffer[++i];
            const count = encodedBuffer[++i];
            for (let j = 0; j < count; j++)
                data.push(value);
        }
        i++;
    }
    return toInt32Array(data);
}
function buildSpriteFromBuffer(buffer, index) {
    const size = buffer[index++];
    const type = buffer[index++];
    const height = buffer[index] >> 16;
    const width = buffer[index++] & ((1 << 17) - 1);
    const sprite = new Sprite([], width, height);
    if (type !== 3)
        throw new Error("Corrupted project file sprite type should be: 3, but is: " + type.toString());
    if (width * height !== size - 3)
        throw new Error("Corrupted project file, sprite width, and height are: (" + width.toString() + "," + height.toString() + "), but size is: " + size.toString());
    const limit = width * height;
    const view = new Int32Array(sprite.pixels.buffer);
    for (let i = 0; i < limit; i++) {
        view[i] = buffer[index];
        index++;
    }
    sprite.refreshImage();
    return new Pair(sprite, size);
}
function buildSpriteAnimationFromBuffer(buffer, index) {
    const size = buffer[index++];
    const type = buffer[index++];
    const width = buffer[index + 2] >> 16;
    const height = buffer[index + 2] & ((1 << 16) - 1);
    if (type !== 2)
        throw new Error("Corrupted project file animation type should be: 2, but is: " + type.toString());
    let i = 2;
    const animation = new SpriteAnimation(0, 0, width, height);
    for (; i < size - 2;) {
        const result = buildSpriteFromBuffer(buffer, index);
        index += result.second;
        i += result.second;
        animation.pushSprite(result.first);
    }
    let spriteMemory = 0;
    animation.sprites.forEach((sprite) => spriteMemory += (sprite.pixels.length >> 2) + 3);
    if (spriteMemory !== size - 2)
        throw new Error("Error invalid group size: " + size.toString() + " should be: " + size.toString());
    return new Pair(animation, size);
}
class Sprite {
    constructor(pixels, width, height, fillBackground = true) {
        this.fillBackground = fillBackground;
        this.imageData = null;
        this.pixels = null;
        this.image = document.createElement("canvas");
        this.ctx = this.image.getContext("2d");
        this.width = width;
        this.height = height;
        this.copy(pixels, width, height);
    }
    createImageData() {
        const canvas = this.image;
        if (canvas.width !== this.width || canvas.height !== this.height) {
            canvas.width = this.width;
            canvas.height = this.height;
        }
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        return this.ctx.createImageData(this.width, this.height);
    }
    copy(pixels, width, height) {
        this.width = width;
        this.height = height;
        if (width !== 0 && height !== 0) {
            if (!this.pixels || this.pixels.length !== pixels.length || this.pixels.length > 0) {
                this.imageData = this.createImageData();
                this.pixels = this.imageData.data;
            }
            const view = new Int32Array(this.pixels.buffer);
            for (let i = 0; i < pixels.length; i++) {
                view[i] = pixels[i].color;
            }
            if (pixels.length)
                this.refreshImage();
        }
    }
    putPixels(ctx) {
        ctx.putImageData(this.imageData, 0, 0);
    }
    fillRect(color, x, y, width, height, view = new Int32Array(this.pixels.buffer)) {
        for (let yi = y; yi < y + height; yi++) {
            const yiIndex = (yi * this.width);
            const rowLimit = x + width + yiIndex;
            for (let xi = x + yiIndex; xi < rowLimit; xi++) {
                view[xi] = color.color;
            }
        }
    }
    fillRectAlphaBlend(source, color, x, y, width, height, view = new Int32Array(this.pixels.buffer)) {
        for (let yi = y; yi < y + height; yi++) {
            for (let xi = x; xi < x + width; xi++) {
                let index = (xi) + (yi * this.width);
                source.color = view[index];
                source.blendAlphaCopy(color);
                view[index] = source.color;
            }
        }
    }
    copyToBuffer(buf, width, height, view = new Int32Array(this.pixels.buffer)) {
        if (width * height !== buf.length) {
            console.log("error invalid dimensions supplied");
            return;
        }
        for (let y = 0; y < this.height && y < height; y++) {
            for (let x = 0; x < this.width && x < width; x++) {
                const i = (x + y * width);
                const vi = x + y * this.width;
                buf[i].color = view[vi];
            }
        }
    }
    binaryFileSize() {
        return 3 + this.width * this.height;
    }
    saveToUint32Buffer(buf, index, view = new Int32Array(this.pixels.buffer)) {
        buf[index++] = this.binaryFileSize();
        buf[index++] = 3;
        buf[index] |= this.height << 16;
        buf[index++] |= this.width;
        for (let i = 0; i < view.length; i++) {
            buf[index] = view[i];
            index++;
        }
        return index;
    }
    refreshImage() {
        const canvas = this.image;
        if (canvas.width !== this.width || canvas.height !== this.height) {
            canvas.width = this.width;
            canvas.height = this.height;
            this.ctx = canvas.getContext("2d");
        }
        this.putPixels(this.ctx);
    }
    copySprite(sprite) {
        this.width = sprite.width;
        this.height = sprite.height;
        if (!this.pixels || this.pixels.length !== sprite.pixels.length) {
            this.imageData = this.createImageData();
            this.pixels = this.imageData.data;
        }
        for (let i = 0; i < this.pixels.length;) {
            this.pixels[i] = sprite.pixels[i++];
            this.pixels[i] = sprite.pixels[i++];
            this.pixels[i] = sprite.pixels[i++];
            this.pixels[i] = sprite.pixels[i++];
        }
    }
    copySpriteBlendAlpha(sprite) {
        if (this.pixels.length !== sprite.pixels.length) {
            this.imageData = this.createImageData();
            this.pixels = this.imageData.data;
        }
        this.width = sprite.width;
        this.height = sprite.height;
        const o = new RGB(0, 0, 0, 0);
        const t = new RGB(0, 0, 0, 0);
        for (let i = 0; i < this.pixels.length; i += 4) {
            o.setRed(sprite.pixels[i]);
            o.setGreen(sprite.pixels[i + 1]);
            o.setBlue(sprite.pixels[i + 2]);
            o.setAlpha(sprite.pixels[i + 3]);
            t.setRed(this.pixels[i]);
            t.setGreen(this.pixels[i + 1]);
            t.setBlue(this.pixels[i + 2]);
            t.setAlpha(this.pixels[i + 3]);
            t.blendAlphaCopy(o);
            this.pixels[i] = t.red();
            this.pixels[i + 1] = t.green();
            this.pixels[i + 2] = t.blue();
            this.pixels[i + 3] = t.alpha();
        }
    }
    draw(ctx, x, y, width, height) {
        if (this.pixels) {
            if (this.fillBackground) {
                ctx.clearRect(x, y, width, height);
            }
            ctx.drawImage(this.image, x, y, width, height);
        }
    }
}
;
class SpriteAnimation {
    constructor(x, y, width, height) {
        this.sprites = [];
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.animationIndex = 0;
    }
    pushSprite(sprite) {
        this.sprites.push(sprite);
    }
    binaryFileSize() {
        let size = 2;
        this.sprites.forEach((sprite) => size += sprite.binaryFileSize());
        return size;
    }
    toGifBlob(callBack, fps = 30) {
        const frameTime = 1000 / fps;
        const gif = new GIF({
            workers: 2,
            quality: 10
        });
        // add an image element
        for (let i = 0; i < this.sprites.length; i++)
            gif.addFrame(this.sprites[i].image, { delay: Math.ceil(frameTime) });
        gif.on('finished', function (blob) {
            callBack(blob);
        });
        gif.render();
    }
    saveToUint32Buffer(buf, index) {
        buf[index++] = this.binaryFileSize();
        buf[index++] = 2;
        this.sprites.forEach((sprite) => index = sprite.saveToUint32Buffer(buf, index));
        return index;
    }
    cloneAnimation() {
        const cloned = new SpriteAnimation(0, 0, this.width, this.height);
        const original = this;
        original.sprites.forEach((sprite) => {
            const clonedSprite = new Sprite([], sprite.width, sprite.height);
            clonedSprite.copySprite(sprite);
            clonedSprite.refreshImage();
            cloned.sprites.push(clonedSprite);
        });
        return cloned;
    }
    draw(ctx, x, y, width, height) {
        if (this.sprites.length) {
            ++this.animationIndex;
            this.sprites[this.animationIndex %= this.sprites.length].draw(ctx, x, y, width, height);
        }
        else {
            this.animationIndex = -1;
        }
    }
}
;
async function fetchImage(url) {
    const img = new Image();
    img.src = URL.createObjectURL(await (await fetch(url)).blob());
    return img;
}
function logToServer(data) {
    fetch("/data", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }).then(res => { console.log("Request complete! response:", data); });
}
function saveBlob(blob, fileName) {
    const a = document.createElement("a");
    if (blob) {
        a.href = window.URL.createObjectURL(blob);
        a.download = fileName;
        a.click();
    }
}
function getWidth() {
    return Math.min(document.body.scrollWidth, document.documentElement.scrollWidth, document.body.offsetWidth, document.documentElement.offsetWidth, document.documentElement.clientWidth);
}
function getHeight() {
    return Math.min(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.documentElement.clientHeight);
}
const max_32_bit_signed = Math.pow(2, 31);
let rand_state = 34;
function srand(seed) {
    rand_state = seed;
}
function random() {
    rand_state *= 1997;
    rand_state ^= rand_state << 5;
    rand_state ^= rand_state >> 18;
    rand_state *= 1997;
    rand_state ^= rand_state << 7;
    rand_state = Math.abs(rand_state);
    return (rand_state) * 1 / max_32_bit_signed;
}
;
class SquareAABBCollidable {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    dim() {
        return [this.x, this.y, this.width, this.height];
    }
    mid_x() {
        return this.x + this.width / 2;
    }
    mid_y() {
        return this.y + this.height / 2;
    }
    check_collision(other) {
        return this.x < other.x + other.width && other.x < this.x + this.width &&
            this.y < other.y + other.height && other.y < this.y + this.height;
    }
}
function distance(a, b) {
    return Math.sqrt(Math.abs(a.mid_x() - b.mid_x()) + Math.abs(a.mid_y() - b.mid_y()));
}
class Faction {
    constructor(name, color, fort_reproduction_unit_limit) {
        this.name = name;
        this.attack = 40 * (1 + random() / 5);
        this.avg_move_value = 0;
        this.sum_move_points = 800 * (0.5 + random());
        this.count_moves = 1;
        this.starting_unit_hp = 100;
        this.fort_defense = 0.15 * (0.75 + random());
        this.unit_defense = 0.05 * (0.75 + random());
        this.color = color;
        this.unit_reproduction_per_second = Math.floor(2.5 * (0.95 + random() / 10));
        this.money_production_per_second = 10;
        this.fort_reproduction_unit_limit = fort_reproduction_unit_limit;
        this.unit_travel_speed = Math.max(getWidth(), getHeight()) / 10;
    }
}
;
class Unit extends SquareAABBCollidable {
    constructor(faction, fort, x, y) {
        super(x, y, Math.ceil(faction.battleField.fort_dim / 6), Math.ceil(faction.battleField.fort_dim / 6));
        this.faction = faction;
        this.hp = faction.starting_unit_hp;
        this.currentFort = fort;
        this.targetFort = fort;
    }
    draw(canvas, ctx) {
        ctx.fillStyle = this.faction.color.htmlRBG();
        ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.width, this.height);
        ctx.strokeStyle = "#000000";
        ctx.strokeRect(Math.floor(this.x), Math.floor(this.y), this.width, this.height);
    }
    update_state(delta_time) {
        if (distance(this, this.targetFort) < 5) {
            if (this.targetFort.faction === this.faction) {
                this.targetFort.units.push(this);
                this.currentFort = this.targetFort;
                return false;
            }
            else {
                this.attack(this.targetFort);
                this.targetFort.attack(this);
                return this.hp > 0;
            }
        }
        else {
            const delta = this.faction.unit_travel_speed * delta_time * 1 / 1000;
            const dy = -this.mid_y() + this.targetFort.mid_y();
            const dx = -this.mid_x() + this.targetFort.mid_x();
            const dist = Math.sqrt(dy * dy + dx * dx);
            const norm_dy = dy / dist;
            const norm_dx = dx / dist;
            this.y += delta * norm_dy;
            this.x += delta * norm_dx;
            return true;
        }
    }
    get_faction() {
        return this.faction;
    }
    lose_hp(hp, enemy) {
        const rand = Math.random();
        if (rand < 0.2) {
            let rand = Math.random();
            rand /= 10;
            if (hp > 0)
                this.hp -= hp * (1 + rand);
            else
                this.hp -= 0.01 * (1 + rand);
        }
        else if (rand < 0.6) {
            if (hp > 0)
                this.hp -= hp;
        }
        else if (rand < 0.7) {
            let rand = Math.random();
            rand /= 3;
            if (hp > 0)
                this.hp -= hp * (1 + rand);
            else
                this.hp -= 0.01 * (1 + rand);
        }
        else if (rand < 0.9) {
            let rand = Math.random();
            rand /= 2;
            if (hp > 0)
                this.hp -= hp * (1 + rand);
            else
                this.hp -= 0.01 * (1 + rand);
        }
        else {
            let rand = Math.random();
            if (hp > 0)
                this.hp -= hp * (1 + rand);
            else
                this.hp -= 0.01 * (1 + rand);
        }
    }
    attack(enemy) {
        enemy.lose_hp(this.offense() * (1 - enemy.defense()), this);
    }
    offense() {
        return this.faction.attack;
    }
    defense() {
        return this.faction.unit_defense;
    }
}
;
class Fort extends SquareAABBCollidable {
    constructor(faction, x, y, width, height) {
        super(x, y, width, height);
        this.faction = faction;
        this.last_update_unit_reproduction = Date.now();
        this.last_update_units_leaving = Date.now();
        this.units = [];
        this.leaving_units = [];
        this.font_size = Math.ceil(this.faction.battleField.fort_dim / 4);
        this.font_name = "Helvetica";
    }
    update_state(delta_time) {
        //reproduce new units
        if (this.units.length < this.faction.fort_reproduction_unit_limit && Date.now() - this.last_update_unit_reproduction > (1000 / this.faction.unit_reproduction_per_second)) {
            const head = this.units.pop();
            this.units.push(new Unit(this.faction, this, this.mid_x(), this.mid_y()));
            if (head)
                this.units.push(head);
            this.last_update_unit_reproduction = Date.now();
        }
        //send out leaving units
        if (Date.now() - this.last_update_units_leaving > 250) {
            const limit = Math.min(3, this.leaving_units.length);
            for (let i = 0; i < limit; i++) {
                const unit = this.leaving_units.pop();
                unit.x += i * unit.width;
                unit.y += i * unit.height;
                this.faction.battleField.traveling_units.push(unit);
            }
            this.last_update_units_leaving = Date.now();
        }
    }
    unsend_units() {
        while (this.leaving_units.length) {
            this.units.push(this.leaving_units.pop());
        }
    }
    send_units(destination) {
        for (let i = 0; i < this.leaving_units.length; i++) {
            this.leaving_units[i].targetFort = destination;
        }
        this.auto_send_units(destination);
    }
    auto_send_units(destination) {
        for (let i = this.units.length - 1; i >= 0; i--) {
            const unit = this.units[i];
            unit.targetFort = destination;
            this.leaving_units.push(unit);
            this.units.pop();
        }
    }
    draw(canvas, ctx) {
        ctx.fillStyle = this.faction.color.htmlRBG();
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.font = `${this.font_size}px ${this.font_name}`;
        if ((this.faction.color.green() + this.faction.color.red() + this.faction.color.blue()) / 3 > (100))
            ctx.fillStyle = "#000000";
        else
            ctx.fillStyle = "#FFFFFF";
        ctx.fillText((this.units.length + this.leaving_units.length) + "", this.mid_x(), this.mid_y(), this.width / 2);
    }
    get_faction() {
        return this.faction;
    }
    lose_hp(hp, enemy) {
        const unit = this.leaving_units[this.leaving_units.length - 1];
        if (unit) {
            this.lose_hp_internal(hp, enemy, unit);
        }
        else {
            const unit = this.units[this.units.length - 1];
            if (unit)
                this.lose_hp_internal(hp, enemy, unit);
        }
    }
    lose_hp_internal(hp, enemy, unit) {
        if (unit) {
            unit.lose_hp(hp, enemy);
            if (unit.hp < 0) {
                this.units.pop();
                if (this.units.length === 0 && this.leaving_units.length === 0) {
                    this.faction = enemy.get_faction();
                }
            }
        }
    }
    attack(enemy) {
        enemy.lose_hp(this.offense() * (1 - enemy.defense()), this);
    }
    offense() {
        return this.faction.attack;
    }
    defense() {
        return this.faction.fort_defense;
    }
}
;
class FortAggregate {
    constructor(fort, defense_power, defense_leaving_forces) {
        this.fort = fort;
        this.defense_power = defense_power;
        this.defense_leaving_forces = defense_leaving_forces;
        this.attacking_force = 0;
    }
    immediate_defense_power() {
        return this.defense_leaving_forces + this.defense_power;
    }
}
;
class FactionAggregate {
}
;
function calc_points_move(attacker, defender, delta_time) {
    let points = 0;
    const time_to_travel = (distance(attacker.fort, defender.fort) / attacker.fort.faction.unit_travel_speed);
    const def_repro_per_frame = defender.fort.faction.unit_reproduction_per_second / (60);
    const enemy_after_time_to_travel_hp = (time_to_travel * def_repro_per_frame < defender.fort.faction.fort_reproduction_unit_limit ?
        time_to_travel * def_repro_per_frame :
        defender.fort.faction.fort_reproduction_unit_limit) + defender.defense_power;
    if (attacker.fort.faction === defender.fort.faction) {
        //points += (attacker.defense_power - enemy_after_time_to_travel_hp * 2) / 5;
        //points -= time_to_travel * (1000 / delta_time);
        //points = -1000;
        //points += (attacker.defense_power) - (enemy_after_time_to_travel_hp + defender.defense_leaving_forces);
    }
    else {
        points += (attacker.defense_power);
        //points += 25;
    }
    points -= (enemy_after_time_to_travel_hp + defender.defense_leaving_forces / 2) + attacker.attacking_force;
    points -= defender.attacking_force / 15;
    return points;
}
class BattleField {
    //has all the forts
    //forts know what faction owns them, how many units they have
    //units know what faction they belong to from there they derive their attack/defense
    //has list of factions
    //factions have offense/defense stats all owned forts take on, and attacking units take on
    constructor(dimensions, factions, fort_dim, fort_count, no_ownership_unit_limit) {
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
        this.ctx = this.canvas.getContext("2d");
        const factions_copy = [];
        factions_copy.push(this.factions[0]);
        for (let i = 0; i < factions.length; i++) {
            const to_copy = factions[i];
            to_copy.battleField = this;
            this.factions.push(to_copy);
            factions_copy.push(to_copy);
        }
        for (let i = 0; i < fort_count; i++) {
            const placed_fort = this.place_random_fort(factions_copy);
            const faction_index = factions_copy.indexOf(placed_fort.faction);
            if (faction_index > 0)
                factions_copy.splice(faction_index, 1);
        }
    }
    player_faction() {
        return this.factions[this.player_faction_index];
    }
    draw(canvas, ctx) {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.forts.forEach(fort => fort.draw(this.canvas, this.ctx));
        this.traveling_units.forEach(unit => unit.draw(this.canvas, this.ctx));
        ctx.clearRect(this.dimensions[0], this.dimensions[1], this.dimensions[2], this.dimensions[3]);
        ctx.drawImage(this.canvas, this.dimensions[0], this.dimensions[1]);
    }
    handleAI(delta_time) {
        let records = [];
        const fort_index_lookup = new Map();
        for (let i = 0; i < this.forts.length; i++) {
            const fort = this.forts[i];
            fort_index_lookup.set(fort, i);
            const record = new FortAggregate(fort, 0, 0);
            for (let j = 0; j < fort.units.length; j++) {
                const unit = fort.units[j];
                record.defense_power += unit.hp * (1 + fort.faction.fort_defense);
            }
            for (let j = 0; j < fort.leaving_units.length; j++) {
                const unit = fort.leaving_units[j];
                record.defense_leaving_forces += unit.hp * (1 + fort.faction.fort_defense);
                const fort_index = fort_index_lookup.get(unit.targetFort);
                if (unit.targetFort.get_faction() !== unit.faction) {
                    record.attacking_force += unit.hp * (1 + unit.faction.unit_defense);
                }
                else {
                    record.defense_force_inbound += unit.hp * (1 + unit.faction.unit_defense);
                }
            }
            records.push(record);
        }
        for (let i = 0; i < this.traveling_units.length; i++) {
            const unit = this.traveling_units[i];
            const fort_index = fort_index_lookup.get(unit.targetFort);
            if (unit.targetFort.get_faction() !== unit.faction) {
                records[fort_index].attacking_force += unit.hp * (1 + unit.faction.unit_defense);
            }
            else {
                records[fort_index].defense_force_inbound += unit.hp * (1 + unit.faction.unit_defense);
            }
        }
        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            if (record.fort.faction !== this.factions[0] && record.fort.faction !== this.factions[1]) {
                //not no faction, and not player
                let max_points = calc_points_move(record, records[0], delta_time);
                let max_index = 0;
                for (let j = 1; j < records.length; j++) {
                    const points = calc_points_move(record, records[j], delta_time);
                    if (max_points < points) {
                        max_points = points;
                        max_index = j;
                    }
                }
                if ((max_points - record.fort.faction.avg_move_value) > 100) {
                    record.fort.faction.sum_move_points += max_points;
                    record.fort.faction.count_moves++;
                    record.fort.faction.avg_move_value = record.fort.faction.sum_move_points / record.fort.faction.count_moves;
                    if (max_points > 10) {
                        console.log(record.fort.faction.name, "\n", max_points, "\n", record.fort.faction.avg_move_value);
                        record.fort.auto_send_units(records[max_index].fort);
                    }
                    if (record.fort.faction.avg_move_value > 1550) {
                        record.fort.faction.sum_move_points = 1100 * record.fort.faction.count_moves;
                        record.fort.faction.avg_move_value = 1100;
                    }
                }
            }
        }
    }
    update_state(delta_time) {
        this.forts.forEach(fort => fort.update_state(delta_time));
        for (let i = 0; i < this.traveling_units.length; i++) {
            const unit = this.traveling_units[i];
            if (!unit.update_state(delta_time)) {
                this.traveling_units.splice(i, 1);
            }
            for (let j = 0; j < this.traveling_units.length; j++) {
                const other = this.traveling_units[j];
                if (unit.check_collision(other)) {
                    if (other.faction !== unit.faction) {
                        unit.attack(other);
                        other.attack(unit);
                        if (other.hp <= 0)
                            this.traveling_units.splice(j, 1);
                        if (unit.hp <= 0) {
                            this.traveling_units.splice(i, 1);
                            break;
                        }
                    }
                    else {
                    }
                }
            }
        }
        this.handleAI(delta_time);
    }
    check_fort_collision(object) {
        for (let i = 0; i < this.forts.length; i++) {
            if (object.check_collision(this.forts[i]))
                return true;
        }
        return false;
    }
    check_valid_fort_position(fort) {
        if (this.check_fort_collision(fort))
            return false;
        if (fort.x < 0 || fort.x + fort.width > this.dimensions[2] || fort.y < 0 || fort.y + fort.width > this.dimensions[3])
            return false;
        return true;
    }
    place_random_fort(factions = this.factions) {
        const x = Math.floor(random() * (this.dimensions[2] - this.fort_dim) + this.dimensions[0]);
        const y = Math.floor(random() * (this.dimensions[3] - this.fort_dim) + this.dimensions[1]);
        const owner = random() < 0.5 ? 0 : Math.floor(random() * factions.length);
        const fort = new Fort(factions[owner], x, y, this.fort_dim, this.fort_dim);
        if (!this.check_valid_fort_position(fort)) {
            this.place_random_fort(factions);
        }
        else {
            this.forts.push(fort);
        }
        return fort;
    }
    place_fort(faction, x, y) {
        this.forts.push(new Fort(faction, x, y, this.fort_dim, this.fort_dim));
        return this.forts[this.forts.length - 1];
    }
    find_nearest_fort(x, y) {
        let found = this.forts[0];
        const point = new SquareAABBCollidable(x, y, 1, 1);
        for (let i = 1; i < this.forts.length; i++) {
            if (distance(found, point) > distance(this.forts[i], point)) {
                found = this.forts[i];
            }
        }
        return found;
    }
}
;
class UpgradePanel extends SimpleGridLayoutManager {
    constructor(faction, attribute_name, matrixDim, pixelDim, x, y) {
        super(matrixDim, pixelDim, x, y);
        this.faction = faction;
        this.attribute_name = attribute_name;
    }
    get_value() {
        return this.faction[this.attribute_name];
    }
}
;
class UpgradeScreen extends SimpleGridLayoutManager {
    constructor(faction, pixelDim, x, y) {
        super([4, 5], pixelDim, x, y);
        this.faction = faction;
    }
}
;
class Game {
    constructor(canvas, factions) {
        this.factions = factions;
        const width = getWidth();
        const height = getHeight();
        this.currentField = new BattleField([0, 0, width, height], this.factions, Math.max(width, height) / 20, 10, 20);
        const touch_listener = new SingleTouchListener(canvas, true, true, false);
        touch_listener.registerCallBack("touchstart", (e) => true, (event) => {
            this.start_touch_fort = this.currentField.find_nearest_fort(event.touchPos[0], event.touchPos[1]);
            console.log("start touch pos:", event.touchPos);
            console.log("start: ", this.start_touch_fort);
        });
        touch_listener.registerCallBack("touchend", (e) => true, (event) => {
            const end_touch_fort = this.currentField.find_nearest_fort(event.touchPos[0], event.touchPos[1]);
            console.log("end touch pos:", event.touchPos);
            console.log("end  fort: ", end_touch_fort);
            if (this.start_touch_fort === end_touch_fort) {
                this.start_touch_fort.unsend_units();
            }
            else {
                this.start_touch_fort.send_units(end_touch_fort);
            }
        });
        //this.upgrade_menu = new UpgradeScreen([canvas.width / 2, canvas.height / 2], canvas.width / 4, canvas.height / 4);
    }
    is_faction_on_field(faction) {
        let counter = 0;
        while (counter < this.currentField.forts.length) {
            if (this.currentField.forts[counter].faction === faction) {
                break;
            }
            counter++;
        }
        return counter !== this.currentField.forts.length;
    }
    update_state(delta_time) {
        if (this.is_game_over()) {
            //do nothing for now
            this.currentField = new BattleField(this.currentField.dimensions, this.factions, Math.min(this.currentField.dimensions[2], this.currentField.dimensions[3]) / 15, 10, 20);
        }
        else {
            this.currentField.update_state(delta_time);
        }
    }
    draw(canvas, ctx) {
        if (!this.is_game_over())
            this.currentField.draw(canvas, ctx);
        //else
        //  this.upgrade_menu.draw(ctx);
    }
    is_game_over() {
        let i = 0;
        let faction = this.currentField.forts[0].faction;
        while (faction === this.currentField.factions[0]) {
            faction = this.currentField.forts[i].faction;
            i++;
        }
        //set i to 0 if it is less than the length of the forts array
        i = this.currentField.forts.length * +(this.currentField.forts.length === i);
        for (; i < this.currentField.forts.length; i++) {
            if (!(this.currentField.forts[i].faction === faction || this.currentField.forts[i].faction === this.currentField.factions[0])) {
                break;
            }
        }
        if (!this.is_faction_on_field(this.currentField.player_faction()) || i === this.currentField.forts.length) {
            return true;
        }
        return false;
    }
}
async function main() {
    const canvas = document.getElementById("screen");
    let maybectx = canvas.getContext("2d");
    if (!maybectx)
        return;
    const ctx = maybectx;
    const keyboardHandler = new KeyboardHandler();
    canvas.onmousemove = (event) => {
    };
    canvas.addEventListener("wheel", (e) => {
        //e.preventDefault();
    });
    //setup rendering canvas, and view
    canvas.width = getWidth();
    canvas.height = getHeight();
    canvas.style.cursor = "pointer";
    let counter = 0;
    const touchScreen = isTouchSupported();
    const factions = [];
    srand(6);
    // seeds 607, 197 are pretty good so far lol
    for (let i = 0; i < 10; i++) {
        factions.push(new Faction("Faction " + i, new RGB(random() * 256, random() * 256, random() * 256), 120));
    }
    srand(Math.random() * max_32_bit_signed);
    const game = new Game(canvas, factions);
    let start = Date.now();
    const drawLoop = async () => {
        game.update_state(Date.now() - start);
        start = Date.now();
        game.draw(canvas, ctx);
        requestAnimationFrame(drawLoop);
    };
    drawLoop();
}
main();
