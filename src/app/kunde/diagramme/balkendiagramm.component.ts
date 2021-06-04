/*
 * Copyright (C) 2015 - present Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { FindError, Kunde, KundeService } from '../shared'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { first, map, tap } from 'rxjs/operators';

import { Component } from '@angular/core';
import type { DataItem } from '@swimlane/ngx-charts';
import { KeineKundenError } from './errors';
import type { OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import log from 'loglevel';

// D3 (= Data Driven Documents) https://d3js.org ist das fuehrende Produkt
// fuer Datenvisualisierung:
//  initiale Version durch die Dissertation von Mike Bostock
//  gesponsort von der New York Times, seinem heutigen Arbeitgeber
//  basiert auf SVG = scalable vector graphics: Punkte, Linien, Kurven, ...
//  ca 250.000 Downloads/Monat bei https://www.npmjs.com
//  https://github.com/mbostock/d3 mit ueber 100 Contributors

// Alternativen:
// ngx-charts:    https://swimlane.gitbook.io/ngx-charts
// Google Charts: https://google-developers.appspot.com/chart
// Chart.js:      https://github.com/nnnick/Chart.js
// Chartist.js:   http://gionkunz.github.io/chartist-js
// n3-chart:      http://n3-charts.github.io/line-chart

// https://www.ngdevelop.tech/best-angular-chart-libraries
// https://openbase.io/packages/top-angular-chart-libraries

/**
 * Komponente mit dem Tag &lt;hs-balkendiagramm&gt; zur Visualisierung
 * von Bewertungen durch ein Balkendiagramm.
 * https://blog.angular-university.io/angular-viewchild
 */
@Component({
    selector: 'hs-balkendiagramm',
    templateUrl: './balkendiagramm.html',
})
export class BalkendiagrammComponent implements OnInit {
    dataItems!: DataItem[];

    constructor(
        private readonly kundeService: KundeService,
        private readonly titleService: Title,
    ) {
        log.debug('BalkendiagrammComponent.constructor()');
    }

    /**
     * Daten fuer das Balkendiagramm bereitstellen.
     */
    ngOnInit() {
        log.debug('BalkendiagrammComponent.ngOnInit()');
        this.setDataItems();
        this.titleService.setTitle('Balkendiagramm');
    }

    private setDataItems() {
        this.kundeService
            .find()
            .pipe(
                map(result => {
                    if (result instanceof FindError) {
                        throw new KeineKundenError();
                    }

                    return result
                        .filter(kunde => kunde.rating !== undefined)
                        .map(kunde => this.toDataItem(kunde));
                }),
                first(),
                tap(dataItems => {
                    this.dataItems = dataItems;
                }),
            )
            .subscribe();
    }

    // https://swimlane.gitbook.io/ngx-charts/examples/bar-charts/vertical-bar-chart
    // https://blog.knoldus.com/visualizing-data-with-ngx-charts-in-angular
    private toDataItem(kunde: Kunde) {
        const dataItem: DataItem = {
            name: kunde._id!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
            value: kunde.rating!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
        };
        return dataItem;
    }
}