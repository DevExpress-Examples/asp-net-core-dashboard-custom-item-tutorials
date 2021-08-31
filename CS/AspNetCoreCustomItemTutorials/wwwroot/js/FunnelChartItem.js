var FunnelChartCustomItem = (function () {
    const Dashboard = DevExpress.Dashboard;
    const Model = DevExpress.Dashboard.Model;
    const Designer = DevExpress.Dashboard.Designer;
    const dxFunnel = DevExpress.viz.dxFunnel;

    const svgIcon = '<svg id="funnelChartItemIcon" viewBox="0 0 24 24"><path stroke="#ffffff" fill="#f442ae" d="M12 2 L2 22 L22 22 Z" /></svg>';
    const funnelChartItemMetaData = {
        bindings: [{
            propertyName: 'measureValue',
            dataItemType: 'Measure',
            displayName: 'Value'
        }, {
            propertyName: 'dimensionValue',
            dataItemType: 'Dimension',
            displayName: 'Argument',
            enableColoring: true,
            enableInteractivity: true
        }],
        interactivity: {
            filter: true
        },
        customProperties: [{
            ownerType: Model.CustomItem,
            propertyName: 'labelPositionProperty',
            valueType: 'string',
            defaultValue: 'Inside'
        }],
        optionsPanelSections: [{
            title: 'Labels',
            items: [{
                dataField: 'labelPositionProperty',
                label: {
                    text: 'Label Position'
                },
                template: Designer.FormItemTemplates.buttonGroup,
                editorOptions: {
                    items: [{ text: 'Inside' }, { text: 'Outside' }]
                }
            }]
        }],
        icon: 'funnelChartItemIcon',
        title: 'Funnel Chart'
    };

    function FunnelChartItemViewer(model, $container, options) {
        var parent = Dashboard.CustomItemViewer.call(this, model, $container, options);

        this.dxFunnelWidget = null;
        this.dxFunnelWidgetSettings = undefined;
    }
    FunnelChartItemViewer.prototype = Object.create(Dashboard.CustomItemViewer.prototype);
    FunnelChartItemViewer.prototype.constructor = FunnelChartItemViewer;

    FunnelChartItemViewer.prototype._getDataSource = function () {
        var clientData = [];
        if (this.getBindingValue('measureValue').length > 0) {
            this.iterateData(function (dataRow) {
                clientData.push({
                    measureValue: dataRow.getValue('measureValue')[0],
                    dimensionValue: dataRow.getValue('dimensionValue')[0] || '',
                    dimensionDisplayText: dataRow.getDisplayText('dimensionValue')[0],
                    measureDisplayText: dataRow.getDisplayText('measureValue')[0],
                    dimensionColor: dataRow.getColor('dimensionValue')[0],
                    clientDataRow: dataRow
                });
            });
        }
        return clientData;
    };

    FunnelChartItemViewer.prototype._getDxFunnelWidgetSettings = function () {
        var _this = this;
        return {
            dataSource: this._getDataSource(),
            argumentField: "dimensionValue",
            valueField: "measureValue",
            colorField: "dimensionColor",
            selectionMode: "multiple",
            label: {
                customizeText: function (e) {
                    return e.item.data.dimensionDisplayText + ': ' + e.item.data.measureDisplayText;
                },
                position: this.getPropertyValue('labelPositionProperty').toLowerCase()
            },
            onItemClick: function (e) {
                _this.setMasterFilter(e.item.data.clientDataRow);
            }
        };
    };

    FunnelChartItemViewer.prototype.setSelection = function () {
        var _this = this;
        this.dxFunnelWidget.getAllItems().forEach(function (item) {
            item.select(_this.isSelected(item.data.clientDataRow));
        });
    };

    FunnelChartItemViewer.prototype.clearSelection = function () {
        this.dxFunnelWidget.clearSelection();
    };

    FunnelChartItemViewer.prototype.setSize = function (width, height) {
        Object.getPrototypeOf(FunnelChartItemViewer.prototype).setSize.call(this, width, height);
        this.dxFunnelWidget.render();
    };

    FunnelChartItemViewer.prototype.renderContent = function ($element, changeExisting) {
        if (!changeExisting) {
            var element = $element.jquery ? $element[0] : $element;

            while (element.firstChild)
                element.removeChild(element.firstChild);

            var div = document.createElement('div');
            div.style.width = "100%";
            div.style.height = "100%";
            element.appendChild(div);
            this.dxFunnelWidget = new dxFunnel(div, this._getDxFunnelWidgetSettings());
        } else {
            this.dxFunnelWidget.option(this._getDxFunnelWidgetSettings());
        }
    };
    function FunnelChartItem(dashboardControl) {
        Dashboard.ResourceManager.registerIcon(svgIcon);
        this.name = "funnelChartCustomItem",
            this.metaData = funnelChartItemMetaData,
            this.createViewerItem = function (model, $element, content) {
                return new FunnelChartItemViewer(model, $element, content);
            }
    };

    return FunnelChartItem;
})();
