window.FunnelChartCustomItem = (function () {
    // #region constMetadata
    const Model = DevExpress.Dashboard.Model;
    const Designer = DevExpress.Dashboard.Designer;
    // #endregion
    const Dashboard = DevExpress.Dashboard;
    const dxFunnel = DevExpress.viz.dxFunnel;
    // #region svgIcon
    const svgIcon = '<svg id="funnelChartItemIcon" viewBox="0 0 24 24"><path stroke="#ffffff" fill="#f442ae" d="M12 2 L2 22 L22 22 Z" /></svg>';
    // #endregion
    // #region metadata
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
    // #endregion
    // #region viewer
    class FunnelChartItemViewer extends Dashboard.CustomItemViewer { 
        constructor(model, $container, options) {
            super(model, $container, options);
            this.dxFunnelWidget = null;
            this.dxFunnelWidgetSettings = undefined;
        }
        _getDataSource() {
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
        }

        _getDxFunnelWidgetSettings() {
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
        }

        setSelection() {
            var _this = this;
            this.dxFunnelWidget.getAllItems().forEach(function (item) {
                item.select(_this.isSelected(item.data.clientDataRow));
            });
        }

        clearSelection() {
            this.dxFunnelWidget.clearSelection();
        }

        setSize(width, height) {
            super.setSize(width, height);
            this.dxFunnelWidget.render();
        }

        allowExportSingleItem() {
            return true;
        }

        renderContent($element, changeExisting) {
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
        }

    }
    // #endregion
    // #region createItem
    class FunnelChartItem {
        constructor(dashboardControl) {
            Dashboard.ResourceManager.registerIcon(svgIcon);
            this.name = "funnelChartCustomItem",
            this.metaData = funnelChartItemMetaData;
        }
        createViewerItem(model, $element, content) {
            return new FunnelChartItemViewer(model, $element, content);
        }
    }

    return FunnelChartItem;
    // #endregion
})();
