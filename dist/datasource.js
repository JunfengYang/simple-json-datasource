'use strict';

System.register(['lodash'], function (_export, _context) {
  "use strict";

  var _, _createClass, GenericDatasource;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('GenericDatasource', GenericDatasource = function () {
        function GenericDatasource(instanceSettings, $q, backendSrv, templateSrv) {
          _classCallCheck(this, GenericDatasource);

          this.type = instanceSettings.type;
          this.url = instanceSettings.url;
          this.name = instanceSettings.name;
          this.q = $q;
          this.backendSrv = backendSrv;
          this.templateSrv = templateSrv;
          this.withCredentials = instanceSettings.withCredentials;
          this.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
          if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
            this.headers['Authorization'] = instanceSettings.basicAuth;
          }
        }

        _createClass(GenericDatasource, [{
          key: 'query',
          value: function query(options) {
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
            var result = [{
              "datapoints": [],
              "type": "docs",
              "targets": "docs",
              "filterable": true
            }];
            return this.doRequest({
              url: this.url + '/select?wt=json&indent=on',
              data: query,
              method: 'POST'
            }).then(function (response) {
              _.map(response.data.response.docs, function (doc, i) {
                result[0].datapoints.push(doc);
              });

              return { data: result };
            });

            // return {data: [{datapoints: [{id: 1, title: "test"}], type: "docs", targets: "docs", filterable: true}]};
          }
        }, {
          key: 'testDatasource',
          value: function testDatasource() {
            return this.doRequest({
              url: this.url + '/',
              method: 'GET'
            }).then(function (response) {
              if (response.status === 200) {
                return { status: "success", message: "Data source is working", title: "Success" };
              }
            });
          }
        }, {
          key: 'annotationQuery',
          value: function annotationQuery(options) {
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
            }).then(function (result) {
              return result.data;
            });
          }
        }, {
          key: 'metricFindQuery',
          value: function metricFindQuery(query) {
            var interpolated = {
              target: this.templateSrv.replace(query, null, 'regex')
            };
            return [{ text: "*:*", value: "*:*" }];
          }
        }, {
          key: 'doRequest',
          value: function doRequest(options) {
            options.withCredentials = this.withCredentials;
            options.headers = this.headers;
            // options.data = "q=*:*&fl=id,title,content&wt=json&indent=on";

            return this.backendSrv.datasourceRequest(options);
          }
        }, {
          key: 'buildQueryParameters',
          value: function buildQueryParameters(options) {
            var _this = this;

            //remove placeholder targets
            options.targets = _.filter(options.targets, function (target) {
              return target.target !== 'select metric';
            });
            options.targets = options.targets.filter(function (t) {
              return !t.hide;
            });

            var targets = _.map(options.targets, function (target) {
              return _this.templateSrv.replace(target.target, options.scopedVars);
            });

            return "&q=".concat(targets.join(" OR "));
          }
        }]);

        return GenericDatasource;
      }());

      _export('GenericDatasource', GenericDatasource);
    }
  };
});
//# sourceMappingURL=datasource.js.map
