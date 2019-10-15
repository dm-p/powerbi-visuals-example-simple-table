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

import * as jQuery from 'jquery';
var dt = require('datatables.net')();

export class Visual implements IVisual {
    private settings: VisualSettings;
    private container: d3.Selection<any, any, any, any>;
    
    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        /** Visual container */
            this.container = d3select.select(options.element)
                .append('div');
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

        /** Add table element */
            let tContainer = this.container
                .append('table')
                    .attr('id', 'example-table');

        /** Add table heading row and columns */
            let tHead = tContainer
                .append('thead')
                    .append('tr');
            table.columns.forEach(
                (col) => {
                    tHead
                        .append('th')
                            .text(col.displayName);
                }
            );

        /** Add table body */
            let tBody = tContainer
                .append('tbody');

        /** Now add rows and columns for each row of data */
            table.rows.forEach(
                (row) => {
                    let tRow = tBody
                        .append('tr');
                    row.forEach(
                        (col) => {
                            tRow
                                .append('td')
                                    .text(col.toString());
                        }
                    )
                }
            );

        /** Render with datatables */
            jQuery(() => {
                console.log('Drawing...');
                jQuery(tContainer.node()).DataTable({
                    searching: false,
                    paging: false,
                    scrollY: `${options.viewport.height}`
                });
                console.log('Table rendered!');
            });
        
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