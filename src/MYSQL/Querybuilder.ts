import { PreparedStatement } from "./PreparedStatement"

export type whereOperator = '>' | '=' | '<' | '>=' | '<=' | '!='

export abstract class QueryBuilder {
    protected _query: {
        select: null | Array<string> | '*',
        insert: boolean,
        table: string | null,
        data: null | Array<{[key:string]: any}>,
        limit: number,
        where: Array<[string, string, any]>
    } = {
        select: null,
        insert: false,
        table: null,
        data: null,
        limit: -1,
        where: []
    }

    public select(keys: Array<string> | '*', table?: string): this {
        if(Array.isArray(keys)) {
            this._query.select = keys
        } else if(keys == '*') {
            this._query.select = '*'
        }

        if(table) {
            this._query.table = table
        }

        return this
    }

    public insertInto(table: string) : this {
        this._query.insert = true
        this._query.table = table

        return this
    }

    public into(table: string) : this {
        this._query.insert = true
        this._query.table = table

        return this
    }

    public from(table: string): this {
        this._query.table = table
        return this
    }

    public where(field: string, rightsideOrOperator: any | whereOperator, rightside?: any): this {
        if(arguments.length == 2) {
            this._query.where.push([field, '=', rightsideOrOperator])
        } else if(arguments.length == 3) {
            this._query.where.push([field, rightsideOrOperator, rightside])
        }

        return this
    }

    public data(values: Array<{[key:string]: any}>): this {
        this._query.data = values

        return this
    }

    private reset(): void {
        this._query = {
            select: null,
            insert: false,
            table: null,
            data: null,
            limit: -1,
            where: []
        }
    }

    public limit(value: number) : this {
        this._query.limit = value
        return this
    }

    public buildQuery(prepared: boolean = false): string {
        let tempString = ''

        if(!this._query.table) throw 'Can\'t build query without table; use ".from(table)" or ".insert(table)"'

        if(this._query.select && !this._query.insert) {
            if(Array.isArray(this._query.select)) {
                tempString += `SELECT (${this._query.select.map(x => '`' + x + '`').join(', ')}) `
            } else if(this._query.select == '*') {
                tempString += 'SELECT * '
            }

            tempString += `FROM ${this._query.table}`

            if(this._query.where.length > 0) {
                let i = 0
                for(let [field, operator, equals] of this._query.where) {
                    tempString += ` ${i > 0 ? 'AND' : 'WHERE'} \`${field}\` ${operator} ${`${prepared ? equals : `'` + equals + `'`}`}`
                    i++
                }
            }

            if(this._query.limit > 0) {
                tempString += ` LIMIT ${this._query.limit}`
            }

        } else if(this._query.insert && !this._query.select) {
            tempString += `INSERT INTO ${this._query.table}`

            if(!this._query.data) throw 'Can\'t insert without data'

            let keys = [...new Set(this._query.data.map(row => Object.keys(row)).flat())].map(x => '`' + x + '`')

            let values = this._query.data.map(row => Object.values(row))

            tempString += ` (${keys.join(', ')})`
            tempString += ` VALUES\n ${values.map(row => `(${row.map(x => prepared  ? x : `'` + x + `'`).join(', ')})`).join(',\n ')}`
        } else {
            throw 'Not yet implemented'
        }

        tempString += ';'
        
        this.reset()
        
        return tempString
    }
}