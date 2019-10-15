'use strict';

import 'core-js/stable';
import './../style/visual.less';
import powerbi from 'powerbi-visuals-api';
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

import { VisualSettings } from './settings';
import * as d3select from 'd3-selection';
var Tabulator = require('tabulator-tables');

export class Visual implements IVisual {
    private settings: VisualSettings;
    private container: d3.Selection<any, any, any, any>;

    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        /** Visual container */
            this.container = d3select.select(options.element)
                .append('div')
                    .attr('id', 'example-table');

    }

    public update(options: VisualUpdateOptions) {
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);

        /** Clear down existing plot */
            this.container.selectAll('*').remove();
            
        /** Test 1: Data view has valid bare-minimum entries */
            let dataViews = options.dataViews;    
            console.log('Test 1: Valid data view...');
            if (!dataViews
                || !dataViews[0]
                || !dataViews[0].table
                || !dataViews[0].table.rows
                || !dataViews[0].table.columns
                || !dataViews[0].metadata
            ) {
                console.log('Test 1 FAILED. No data to draw table.');
                return;
            }
        
        /** If we get this far, we can trust that we can work with the data! */
            let table = dataViews[0].table;

        /** Set up table config */
            let tableConfig: Tabulator.Options = {

                /** For columns, here is our strategy:
                 *  - Iterate through table columns and assign the `displayName` to the `title`. This ensures that
                 *      if we rename the field in the pane, then the title is correctly reflected. This is the
                 *      same approach we took when building a raw HTML table.
                 *  - Tabulator requires a `field` property. Because Power BI can conceivably allow us to add the
                 *      same field with the same name multiple times, we will use the index assigned by Power BI 
                 *      in the `dataView` as our column ID.
                 */
                    columns: table.columns.map((col) => ({
                            title: col.displayName,
                            field: col.index.toString()
                        })
                    ),
                
                /** For table data, our strategy is as follows:    
                 *   -  Each row needs an ID - we will just make this row index + 1. We'll instantiate an object
                 *        with this inside it, as we'll extend the object structure in the next part of our strategy.
                 *   -  Because our columns are dynamic and tabulator uses JS object syntax, we will dynamically
                 *        add keys/values for each column we come across to the object we created in the step above.
                 *   -  Key names will match the index number we used in the `columns` object above. This allows
                 *        Tabulator to recognise which column the value belongs to.
                 *   -  We're currently just casting the value we find in each column for the row to a string and
                 *        aren't considering the possibility of numbers of different formats at present.
                 */
                    data: table.rows.map((row, ri) => {

                            /** Base object, with row ID */
                                let fields = {
                                    id: ri + 1
                                };

                            /** Add in key/value pairs for row data, ampping to column index */
                                table.columns.map((col, ci) => {
                                    fields[`${col.index}`] = row[ci].toString();
                                });

                            return fields;
                        }
                    ),

                /** Anything else we want to do by default */
                    height: '100%'

            };

        /** Add table to DOM and let Tabulator do its thing */
            console.log('Rendering...');
            console.log(Tabulator);
            let grid = new Tabulator(this.container.node(), tableConfig);     

            console.log('Table rendered!');
        
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return VisualSettings.parse(dataView) as VisualSettings;
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}