import _ from "lodash";

export class GenericDatasource {

  constructor(instanceSettings, $q, backendSrv, templateSrv) {
    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
    this.withCredentials = instanceSettings.withCredentials;
    this.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
    if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
      this.headers['Authorization'] = instanceSettings.basicAuth;
    }
  }

  query(options) {
    var query = this.buildQueryParameters(options);
    // query.targets = query.targets.filter(t => !t.hide);
    //
    // if (query.targets.length <= 0) {
    //   return this.q.when({data: []});
    // }

//     var result = [
//   {
//     "columns":[
//       {"text":"ID","type":"string"},
//       {"text":"Title","type":"string"}
//     ],
//     "rows":[],
//     "type":"table"
//   }
// ];
      var result = [
          {
            "datapoints": [],
            "type": "docs",
            "targets": "docs",
            "filterable": true
          }
      ];
    return this.doRequest({
      url: this.url + '/select?wt=json&indent=on',
      data: query,
      method: 'POST'
    }).then(response => {
        _.map(response.data.response.docs, (doc, i) => {
              result[0].datapoints.push(doc);
            });

        return {data: result};
    });


      // return {data: [{datapoints: [{id: 1, title: "test"}], type: "docs", targets: "docs", filterable: true}]};
  }

  testDatasource() {
    return this.doRequest({
      url: this.url + '/',
      method: 'GET',
    }).then(response => {
      if (response.status === 200) {
        return { status: "success", message: "Data source is working", title: "Success" };
      }
    });
  }

  annotationQuery(options) {
    var query = this.templateSrv.replace(options.annotation.query, {}, 'glob');
    var annotationQuery = {
      range: options.range,
      annotation: {
        name: options.annotation.name,
        datasource: options.annotation.datasource,
        enable: options.annotation.enable,
        iconColor: options.annotation.iconColor,
        query: query
      },
      rangeRaw: options.rangeRaw
    };

    return this.doRequest({
      url: this.url + '/annotations',
      method: 'POST',
      data: annotationQuery
    }).then(result => {
      return result.data;
    });
  }

  metricFindQuery(query) {
    var interpolated = {
        target: this.templateSrv.replace(query, null, 'regex')
    };
    return [{text: "*:*", value: "*:*"}];
  }

  doRequest(options) {
    options.withCredentials = this.withCredentials;
    options.headers = this.headers;
    // options.data = "q=*:*&fl=id,title,content&wt=json&indent=on";

    return this.backendSrv.datasourceRequest(options);
  }

  buildQueryParameters(options) {
    //remove placeholder targets
    options.targets = _.filter(options.targets, target => {
      return target.target !== 'select metric';
    });
    options.targets = options.targets.filter(t => !t.hide);

    var targets = _.map(options.targets, target => {
      return this.templateSrv.replace(target.target, options.scopedVars)
    });

    return "&q=".concat(targets.join(" OR "));
  }
}
