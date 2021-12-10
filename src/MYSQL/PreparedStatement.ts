import { MYSQLConnection } from "./MYSQLConnection"

let ID = 0

export class PreparedStatement {
    private query: string
    private sqlConnection: MYSQLConnection

    private id: string

    constructor(query: string, sqlConnection: MYSQLConnection) {
        this.query = query
        this.sqlConnection = sqlConnection

        this.id = ('STATEMENT_') + ++ID
    }

    public emit(): Promise<this> {
        return new Promise((res) => {
            this.sqlConnection.__perform_query(`PREPARE ${this.id} FROM '${this.query}'`).then(() => res(this))
        })
    }

    public perform(...args: any[]): Promise<any> {
        let tempQuery = ''

        for(let i in args) {
            tempQuery += `SET @VAR_${i} = '${args[i]}';\n`
        }

        tempQuery += `EXECUTE ${this.id} USING ${args.map((_, i) => `@VAR_${i}`).join(', ')};`

        return this.sqlConnection.__perform_query(tempQuery)
    }
}