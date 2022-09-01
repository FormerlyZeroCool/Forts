
export interface FilesHaver{
    files:FileList;
};
export function threeByThreeMat(a:number[], b:number[]):number[]
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
export function matByVec(mat:number[], vec:number[]):number[]
{
    return [mat[0]*vec[0]+mat[1]*vec[1]+mat[2]*vec[2],
            mat[3]*vec[0]+mat[4]*vec[1]+mat[5]*vec[2],
            mat[6]*vec[0]+mat[7]*vec[1]+mat[8]*vec[2]];
}
export class Queue<T> {
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
export class FixedSizeQueue<T> {
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
export class RollingStack<T> {
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

export class DynamicInt32Array {
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

export function toInt32Array(data:number[]): Int32Array
{
    const newData:Int32Array = new Int32Array(data.length);
    for(let i = 0; i < data.length; i++)
    {
        newData[i] = data[i];
    }
    return newData;
}

export async function fetchImage(url:string):Promise<HTMLImageElement>
{
    const img = new Image();
    img.src =  URL.createObjectURL(await (await fetch(url)).blob());
    return img;
}
export function logToServer(data:any):void
{
    fetch("/data", {
        method: "POST", 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      }).then(res => {console.log("Request complete! response:", data);});

}
export function saveBlob(blob:Blob, fileName:string){
    const a:HTMLAnchorElement = document.createElement("a");
    if(blob)
    {
        a.href = window.URL.createObjectURL(blob);
        a.download = fileName;
        a.click();
    }
}
export const max_32_bit_signed:number = Math.pow(2, 31);
export let rand_state:number = 34;
export function srand(seed:number):void
{
    rand_state = seed;
}
export function random():number
{
  rand_state *= 1997;
  rand_state ^= rand_state << 5;
  rand_state ^= rand_state >> 18;
  rand_state *= 1997;
  rand_state ^= rand_state << 7;
  rand_state = Math.abs(rand_state);
  return (rand_state) * 1 / max_32_bit_signed;
}


export function findLeastUsedDoubleWord(buffer:Int32Array): number
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
export function rleEncode(buffer:Int32Array):Int32Array 
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
export function rleDecode(encodedBuffer:Int32Array): Int32Array
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

export function sleep(ms:number):Promise<void> {
    return new Promise<void>((resolve:any) => setTimeout(resolve, ms));
}
export function changeFavicon(src:string): void
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