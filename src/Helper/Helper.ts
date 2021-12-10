export function Default(obj: any, defaults: any) {
    return  {...defaults, ...obj}
}

export type Maybe<T> = T | null | undefined

type StandardEnum<T> = {
    [id: string]: T | string;
    [nu: number]: string;
}

export function ReadFlagsFromInt<T>(value: number, flags: StandardEnum<number>): Array<T> {
    let tempArray: Array<T> = []

    for(let [k, v] of Object.entries(flags)) {
        if(typeof k == 'string') {
            if(value & v as number) tempArray.push(v as unknown as T)
        }
    }

    return tempArray
}

export function WriteFlagsToInt<T>(flags: Array<T>): number {
    let tempNum: number = 0

    for(let k of flags) {
        if(typeof k == 'number')
            tempNum |= k
    }

    return tempNum
}

export function PrettyPrintEnum(value: keyof StandardEnum<unknown>, list: StandardEnum<unknown>) {
    return list[value]
}