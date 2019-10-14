'use strict';

import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

export class VisualSettings extends DataViewObjectsParser {
    public tabulatorPersistentConfig: TabulatorPersistentConfig = new TabulatorPersistentConfig();
}

export class TabulatorPersistentConfig {
    /** Array of widths for tabulator - this needs to be persisted/parsed as stirng to be compatible with the Power BI PrimitiveValue */
        public columnWidths: string = '';
}