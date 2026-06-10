import { TableColumn, TableForeignKey } from 'typeorm';
import { TableForeignKeyOptions } from 'typeorm/schema-builder/options/TableForeignKeyOptions';

export class BaseColumn {
    public isIndex = false;
    public foreignKeys: TableForeignKeyOptions[] = [];

    public constructor(public tableColumn: TableColumn) {}

    public length(length: number): this {
        this.tableColumn.length = length as any;
        return this;
    }

    public nullable(): this {
        this.tableColumn.isNullable = true;
        return this;
    }

    public notNullable(): this {
        this.tableColumn.isNullable = false;
        return this;
    }

    public unique(): this {
        this.tableColumn.isUnique = true;
        return this;
    }

    public index(): this {
        this.isIndex = true;
        return this;
    }

    public default(value: any): this {
        this.tableColumn.default = value;
        return this;
    }

    public primary(constraintName?: string): this {
        this.tableColumn.isPrimary = true;
        if (constraintName) {
            this.tableColumn.primaryKeyConstraintName = constraintName;
        }
        return this;
    }

    public array(): this {
        this.tableColumn.isArray = true;
        return this;
    }

    public autoIncrement(): this {
        this.tableColumn.isGenerated = true;
        this.tableColumn.generationStrategy = 'increment';
        return this;
    }

    public generated(strategy: 'increment' | 'uuid' | 'rowid' | 'identity' = 'increment'): this {
        this.tableColumn.isGenerated = true;
        this.tableColumn.generationStrategy = strategy;
        return this;
    }

    /**
     * Identity column. Supported only in Postgres 10+.
     */
    public generatedIdentity(value: 'ALWAYS' | 'BY DEFAULT' = 'BY DEFAULT'): this {
        this.tableColumn.isGenerated = true;
        this.tableColumn.generationStrategy = 'identity';
        this.tableColumn.generatedIdentity = value;
        return this;
    }

    /**
     * Generated (computed) column expression.
     */
    public asExpression(expression: string, generatedType: 'VIRTUAL' | 'STORED' = 'STORED'): this {
        this.tableColumn.asExpression = expression;
        this.tableColumn.generatedType = generatedType;
        return this;
    }

    public precision(precision: number, scale?: number): this {
        this.tableColumn.precision = precision;
        if (scale !== undefined) {
            this.tableColumn.scale = scale;
        }
        return this;
    }

    public scale(scale: number): this {
        this.tableColumn.scale = scale;
        return this;
    }

    public charset(charset: string): this {
        this.tableColumn.charset = charset;
        return this;
    }

    public collation(collation: string): this {
        this.tableColumn.collation = collation;
        return this;
    }

    public enum(values: string[], enumName?: string): this {
        this.tableColumn.enum = values;
        if (enumName) {
            this.tableColumn.enumName = enumName;
        }
        return this;
    }

    public spatial(spatialFeatureType: string, srid?: number): this {
        this.tableColumn.spatialFeatureType = spatialFeatureType;
        if (srid !== undefined) {
            this.tableColumn.srid = srid;
        }
        return this;
    }

    /**
     * Column type's display width. Works only for MySQL.
     */
    public width(width: number): this {
        this.tableColumn.width = width;
        return this;
    }

    /**
     * UNSIGNED attribute. Works only for MySQL.
     */
    public unsigned(): this {
        this.tableColumn.unsigned = true;
        return this;
    }

    /**
     * ZEROFILL attribute. Works only for MySQL.
     */
    public zerofill(): this {
        this.tableColumn.zerofill = true;
        return this;
    }

    /**
     * ON UPDATE trigger. Works only for MySQL.
     */
    public onUpdate(value: string): this {
        this.tableColumn.onUpdate = value;
        return this;
    }

    public useCurrent(): this {
        this.tableColumn.default = 'now()';
        return this;
    }

    public comment(comment: string): this {
        this.tableColumn.comment = comment;
        return this;
    }

    public foreign(
        table: string,
        column: string = 'id',
        onDelete = 'CASCADE',
        onUpdate = 'CASCADE',
        name?: string
    ): void {
        this.foreignKeys.push(
            new TableForeignKey({
                name,
                columnNames: [this.tableColumn.name],
                referencedTableName: table,
                referencedColumnNames: [column],
                onDelete: onDelete,
                onUpdate: onUpdate
            })
        );
    }
}
