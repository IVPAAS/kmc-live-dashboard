import { Component, OnInit } from '@angular/core';
import { BootstrapService } from "./bootstrap.service";
import { TranslateService } from "ng2-translate";
import { LiveDashboardConfiguration } from "./services/live-dashboard-configuration.service";
import { LiveEntryService } from "./live-entry.service";
import { AreaBlockerMessage } from "@kaltura-ng/kaltura-ui";
import { environment } from "../environments/environment";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public _applicationNotLoaded: boolean = true;
  public _sectionBlockerMessage: AreaBlockerMessage;

  constructor(private _bootstrapService: BootstrapService,
              private _translate: TranslateService,
              private _liveDashboardConfiguration: LiveDashboardConfiguration,
              private _liveEntryService: LiveEntryService) {
  }

  ngOnInit() {
    // init i18n
    let browserLang = this._liveDashboardConfiguration.lang ? this._liveDashboardConfiguration.lang : 'en';

    // use only prefix (e.g: all english begin with en-xx)
    if (browserLang) {
      browserLang = browserLang.substr(0, 2);
    }
    this._translate.use(browserLang.match(/de|en|es|fr|ja/) ? browserLang : 'en');

    if (this._bootstrapService.initStatus) {
      this._applicationNotLoaded = false;
      this._liveEntryService.InitializeLiveEntryService();
    }
    else {
      this._applicationNotLoaded = true;
      this._sectionBlockerMessage = new AreaBlockerMessage({
        message: this._translate.instant(environment.bootstrap.error_message),
        buttons: []
      });
    }
  }
}
