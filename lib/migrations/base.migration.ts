import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex, TableUnique } from 'typeorm';
import { BaseTable } from './base.table';

export abstract class BaseMigration implements MigrationInterface {
    private queryRunner: QueryRunner = null;

    async create(tableName: string, callback: (table: BaseTable) => void): Promise<void> {
        const table = new BaseTable();
        callback(table);
        const newTable = new Table();
        newTable.name = tableName;
        newTable.columns = table.getNewColumns();
        await this.queryRunner.createTable(newTable);
        await this.createIndex(tableName, table);
        await this.createForeignKeys(tableName, table);
    }

    async update(tableName: string, callback: (table: BaseTable) => void): Promise<void> {
        const table = new BaseTable();
        callback(table);
        for (const column of table.columnToDeletes) {
            await this.queryRunner.dropColumn(tableName, column);
        }
        if (table.getNewColumns()) {
            await this.queryRunner.addColumns(tableName, table.getNewColumns());
        }
        await this.createIndex(tableName, table);
        await this.createForeignKeys(tableName, table);
    }

    async drop(table: Table | string): Promise<void> {
        await this.queryRunner.dropTable(table);
    }

    async createForeignKeys(tableName: string, table: BaseTable): Promise<void> {
        for (const column of table.getForeignKeys()) {
            await this.queryRunner.createForeignKey(tableName, column);
        }
    }

    async createIndex(tableName: string, table: BaseTable): Promise<void> {
        for (const column of table.getIndexColumns()) {
            const index = new TableIndex({
                name: `${tableName}-${column.name}Index`,
                columnNames: [column.name]
            });
            await this.queryRunner.createIndex(tableName, index);
        }
    }

    abstract run(queryRunner: QueryRunner): Promise<void>;

    async rollback(queryRunner: QueryRunner): Promise<void> {
        console.log('No rollback');
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        this.queryRunner = queryRunner;
        await this.rollback(queryRunner);
    }

    async up(queryRunner: QueryRunner): Promise<void> {
        this.queryRunner = queryRunner;
        await this.run(queryRunner);
    }

    async dropIfExists(table: Table | string): Promise<void> {
        if (await this.queryRunner.hasTable(table)) {
            await this.queryRunner.dropTable(table);
        }
    }

    async hasTable(tableName: string): Promise<boolean> {
        return this.queryRunner.hasTable(tableName);
    }

    async hasColumn(tableName: string, columnName: string): Promise<boolean> {
        return this.queryRunner.hasColumn(tableName, columnName);
    }

    async rename(oldTableOrName: Table | string, newTableName: string): Promise<void> {
        await this.queryRunner.renameTable(oldTableOrName, newTableName);
    }

    async createUnique(table: Table | string, columnName: string, name?: string): Promise<void> {
        await this.queryRunner.createUniqueConstraint(
            table,
            new TableUnique({ name: name || `${table}-${columnName}Unique`, columnNames: [columnName] })
        );
    }

    async dropUnique(table: Table | string, uniqueOrName: TableUnique): Promise<void> {
        await this.queryRunner.dropUniqueConstraint(table, uniqueOrName);
    }

    async dropUniqueColumn(table: Table | string, columnName: string): Promise<void> {
        await this.queryRunner.dropUniqueConstraint(table, `${table}-${columnName}Unique`);
    }

    async renameColumn(table: Table | string, oldColumnName: string, newColumnName: string): Promise<void> {
        await this.queryRunner.renameColumn(table, oldColumnName, newColumnName);
    }

    async changeColumn(table: Table | string, oldColumn: TableColumn | string, newColumn: TableColumn): Promise<void> {
        await this.queryRunner.changeColumn(table, oldColumn, newColumn);
    }

    async dropColumn(table: Table | string, columnName: string): Promise<void> {
        await this.queryRunner.dropColumn(table, columnName);
    }

    async dropColumns(table: Table | string, columnNames: string[]): Promise<void> {
        await this.queryRunner.dropColumns(table, columnNames);
    }

    async dropIndex(table: Table | string, index: TableIndex | string): Promise<void> {
        await this.queryRunner.dropIndex(table, index);
    }

    async dropForeign(table: Table | string, foreignKeyOrName: TableForeignKey | string): Promise<void> {
        await this.queryRunner.dropForeignKey(table, foreignKeyOrName);
    }
}
