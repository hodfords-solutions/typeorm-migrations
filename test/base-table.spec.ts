import { BaseColumn, BaseTable } from '@hodfords/typeorm-migrations';
import { TableColumn } from 'typeorm';

describe('BaseTable', () => {
    let table: BaseTable;

    beforeEach(() => {
        table = new BaseTable();
    });

    const getColumn = (name: string): TableColumn => {
        return table.getNewColumns().find((column) => column.name === name);
    };

    describe('simple column types', () => {
        const simpleTypes: [keyof BaseTable, string][] = [
            ['bytea', 'bytea'],
            ['tsvector', 'tsvector'],
            ['text', 'text'],
            ['integer', 'integer'],
            ['smallint', 'smallint'],
            ['bigint', 'bigint'],
            ['double', 'double precision'],
            ['timestamp', 'timestamp'],
            ['date', 'date'],
            ['boolean', 'boolean'],
            ['jsonb', 'jsonb'],
            ['json', 'json'],
            ['real', 'real'],
            ['doublePrecision', 'double precision'],
            ['float', 'double precision'],
            ['float4', 'real'],
            ['float8', 'double precision'],
            ['time', 'time'],
            ['timetz', 'timetz'],
            ['timestamptz', 'timestamptz'],
            ['macaddr', 'macaddr'],
            ['inet', 'inet'],
            ['money', 'money'],
            ['citext', 'citext'],
            ['hstore', 'hstore'],
            ['interval', 'interval'],
            ['point', 'point'],
            ['line', 'line'],
            ['lseg', 'lseg'],
            ['box', 'box'],
            ['path', 'path'],
            ['polygon', 'polygon'],
            ['circle', 'circle'],
            ['cidr', 'cidr'],
            ['macaddr8', 'macaddr8'],
            ['tsquery', 'tsquery'],
            ['xml', 'xml'],
            ['int4range', 'int4range'],
            ['int8range', 'int8range'],
            ['numrange', 'numrange'],
            ['tsrange', 'tsrange'],
            ['tstzrange', 'tstzrange'],
            ['daterange', 'daterange'],
            ['cube', 'cube'],
            ['ltree', 'ltree']
        ];

        it.each(simpleTypes)('%s() creates a column of type "%s"', (method, expectedType) => {
            const result = (table[method] as (name: string) => BaseColumn)('testColumn');
            expect(result).toBeInstanceOf(BaseColumn);
            expect(getColumn('testColumn').type).toEqual(expectedType);
        });
    });

    describe('array column types', () => {
        const arrayTypes: [keyof BaseTable, string][] = [
            ['strings', 'character varying'],
            ['uuids', 'uuid'],
            ['smallints', 'smallint'],
            ['bigints', 'bigint'],
            ['booleans', 'boolean'],
            ['jsonbs', 'jsonb'],
            ['texts', 'text']
        ];

        it.each(arrayTypes)('%s() creates an array column of type "%s"', (method, expectedType) => {
            (table[method] as (name: string) => BaseColumn)('testColumn');
            const column = getColumn('testColumn');
            expect(column.type).toEqual(expectedType);
            expect(column.isArray).toEqual(true);
        });
    });

    describe('column()', () => {
        it('creates a column with an arbitrary type and options', () => {
            table.column('custom', 'ltree', { isNullable: true });
            const column = getColumn('custom');
            expect(column.type).toEqual('ltree');
            expect(column.isNullable).toEqual(true);
        });
    });

    describe('string()', () => {
        it('creates a varchar column with default length 255', () => {
            table.string('name');
            const column = getColumn('name');
            expect(column.type).toEqual('character varying');
            expect(column.length).toEqual(255);
        });

        it('accepts a custom length', () => {
            table.string('code', 10);
            expect(getColumn('code').length).toEqual(10);
        });
    });

    describe('varchar()', () => {
        it('is an alias of string()', () => {
            table.varchar('name', 100);
            const column = getColumn('name');
            expect(column.type).toEqual('character varying');
            expect(column.length).toEqual(100);
        });
    });

    describe('char()', () => {
        it('creates a char column with the given length', () => {
            table.char('code', 3);
            const column = getColumn('code');
            expect(column.type).toEqual('char');
            expect(column.length).toEqual('3');
        });
    });

    describe('uuid()', () => {
        it('creates an uuid column with default name "id"', () => {
            table.uuid();
            expect(getColumn('id').type).toEqual('uuid');
        });
    });

    describe('primaryUuid()', () => {
        it('creates a primary uuid column with uuid_generate_v4 default', () => {
            table.primaryUuid();
            const column = getColumn('id');
            expect(column.isPrimary).toEqual(true);
            expect(column.default).toEqual('uuid_generate_v4()');
        });
    });

    describe('primaryUuidV7()', () => {
        it('creates a primary uuid column with uuidv7 default', () => {
            table.primaryUuidV7();
            const column = getColumn('id');
            expect(column.isPrimary).toEqual(true);
            expect(column.default).toEqual('uuidv7()');
        });
    });

    describe('id() and increments()', () => {
        it.each(['id', 'increments'] as (keyof BaseTable)[])(
            '%s() creates an auto-incrementing primary integer column',
            (method) => {
                (table[method] as (name: string) => BaseColumn)('id');
                const column = getColumn('id');
                expect(column.type).toEqual('integer');
                expect(column.isPrimary).toEqual(true);
                expect(column.isGenerated).toEqual(true);
                expect(column.generationStrategy).toEqual('increment');
            }
        );
    });

    describe('smallIncrements() and bigIncrements()', () => {
        it('smallIncrements() creates an auto-incrementing primary smallint column', () => {
            table.smallIncrements('id');
            const column = getColumn('id');
            expect(column.type).toEqual('smallint');
            expect(column.isPrimary).toEqual(true);
            expect(column.isGenerated).toEqual(true);
        });

        it('bigIncrements() creates an auto-incrementing primary bigint column', () => {
            table.bigIncrements('id');
            const column = getColumn('id');
            expect(column.type).toEqual('bigint');
            expect(column.isPrimary).toEqual(true);
            expect(column.isGenerated).toEqual(true);
        });
    });

    describe('decimal()', () => {
        it('creates a decimal column with default precision and scale', () => {
            table.decimal('price');
            const column = getColumn('price');
            expect(column.type).toEqual('decimal');
            expect(column.precision).toEqual(10);
            expect(column.scale).toEqual(2);
        });

        it('accepts custom precision and scale', () => {
            table.decimal('price', 12, 4);
            const column = getColumn('price');
            expect(column.precision).toEqual(12);
            expect(column.scale).toEqual(4);
        });
    });

    describe('numeric()', () => {
        it('creates a numeric column with precision and scale', () => {
            table.numeric('amount', 14, 6);
            const column = getColumn('amount');
            expect(column.type).toEqual('numeric');
            expect(column.precision).toEqual(14);
            expect(column.scale).toEqual(6);
        });
    });

    describe('bit() and varbit()', () => {
        it('bit() creates a bit column with default length 1', () => {
            table.bit('flags');
            const column = getColumn('flags');
            expect(column.type).toEqual('bit');
            expect(column.length).toEqual('1');
        });

        it('varbit() creates a bit varying column', () => {
            table.varbit('flags', 8);
            const column = getColumn('flags');
            expect(column.type).toEqual('bit varying');
            expect(column.length).toEqual('8');
        });
    });

    describe('enum()', () => {
        it('creates an enum column from an array of values', () => {
            table.enum('status', 'user_status_enum', ['active', 'inactive']);
            const column = getColumn('status');
            expect(column.type).toEqual('enum');
            expect(column.enumName).toEqual('user_status_enum');
            expect(column.enum).toEqual(['active', 'inactive']);
        });

        it('creates an enum column from an object of values', () => {
            table.enum('status', 'user_status_enum', { ACTIVE: 'active', INACTIVE: 'inactive' });
            expect(getColumn('status').enum).toEqual(['active', 'inactive']);
        });
    });

    describe('geography() and geometry()', () => {
        it('geography() creates a geography column with default srid 4326', () => {
            table.geography('location', 'Point');
            const column = getColumn('location');
            expect(column.type).toEqual('geography');
            expect(column.spatialFeatureType).toEqual('Point');
            expect(column.srid).toEqual(4326);
        });

        it('geometry() creates a geometry column with default srid 0', () => {
            table.geometry('shape', 'Polygon');
            const column = getColumn('shape');
            expect(column.type).toEqual('geometry');
            expect(column.spatialFeatureType).toEqual('Polygon');
            expect(column.srid).toEqual(0);
        });
    });

    describe('timestamp helpers', () => {
        it('createdAt() creates a timestamp column with now() default', () => {
            table.createdAt();
            const column = getColumn('createdAt');
            expect(column.type).toEqual('timestamp');
            expect(column.default).toEqual('now()');
        });

        it('updatedAt() creates a timestamp column with now() default', () => {
            table.updatedAt();
            expect(getColumn('updatedAt').default).toEqual('now()');
        });

        it('deletedAt() creates a nullable timestamp column', () => {
            table.deletedAt();
            expect(getColumn('deletedAt').isNullable).toEqual(true);
        });

        it('baseTime() creates both createdAt and updatedAt columns', () => {
            table.baseTime();
            expect(getColumn('createdAt')).toBeDefined();
            expect(getColumn('updatedAt')).toBeDefined();
        });
    });

    describe('dropColumn()', () => {
        it('registers the column for deletion', () => {
            table.dropColumn('legacy');
            expect(table.columnToDeletes).toEqual(['legacy']);
        });
    });

    describe('getIndexColumns()', () => {
        it('returns columns marked with index()', () => {
            table.string('email').index();
            table.string('name');
            const indexColumns = table.getIndexColumns();
            expect(indexColumns).toHaveLength(1);
            expect(indexColumns[0].name).toEqual('email');
        });

        it('includes columns registered via addIndexAlreadyColumn()', () => {
            table.addIndexAlreadyColumn('existingColumn');
            const indexColumns = table.getIndexColumns();
            expect(indexColumns).toHaveLength(1);
            expect(indexColumns[0].name).toEqual('existingColumn');
        });
    });

    describe('getForeignKeys()', () => {
        it('collects foreign keys from all columns', () => {
            table.uuid('userId').foreign('User');
            table.uuid('roleId').foreign('Role', 'uuid', 'SET NULL', 'NO ACTION');
            const foreignKeys = table.getForeignKeys();
            expect(foreignKeys).toHaveLength(2);
            expect(foreignKeys[0].referencedTableName).toEqual('User');
            expect(foreignKeys[1].referencedColumnNames).toEqual(['uuid']);
            expect(foreignKeys[1].onDelete).toEqual('SET NULL');
        });
    });

    describe('options override', () => {
        it('merges custom options into the column definition', () => {
            table.string('email', 255, { isNullable: true, isUnique: true });
            const column = getColumn('email');
            expect(column.isNullable).toEqual(true);
            expect(column.isUnique).toEqual(true);
        });
    });
});
