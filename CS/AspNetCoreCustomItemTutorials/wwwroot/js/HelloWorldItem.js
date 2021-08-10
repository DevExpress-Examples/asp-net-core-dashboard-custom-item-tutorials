var HelloWorldCustomItem = (function () {
    var svgIcon = '<svg id="helloWorldItemIcon" viewBox="0 0 24 24"><path stroke="#42f48f" fill="#42f48f" d="M12 2 L2 22 L22 22 Z" /></svg>';
    var helloWorldItemMetaData = {
        customProperties: [{
            ownerType: 'CustomItem',
            propertyName: 'customProperty',
            valueType: 'string',
            defaultValue: 'Hello World!'
        }],
        optionsPanelSections: [{
            title: 'Custom Properties',
            items: [{
                dataField: 'customProperty',
                label: {
                    text: 'Item Text'
                },
                editorType: 'dxTextBox',
                editorOptions: {
                    placeholder: "Enter text to display"
                }
            }]
        }],
        icon: 'helloWorldItemIcon',
        title: 'Hello World Item'
    };
    function HelloWorldItemViewer(model, $container, options) {
        DevExpress.Dashboard.CustomItemViewer.call(this, model, $container, options);
    }
    HelloWorldItemViewer.prototype = Object.create(DevExpress.Dashboard.CustomItemViewer.prototype);
    HelloWorldItemViewer.prototype.constructor = HelloWorldItemViewer;

    HelloWorldItemViewer.prototype.renderContent = function ($element, changeExisting) {
        var element = $element.jquery ? $element[0] : $element;
        element.innerText = this.getPropertyValue('customProperty');
    };
    function HelloWorldItem(dashboardControl) {
        DevExpress.Dashboard.ResourceManager.registerIcon(svgIcon);
        this.name = "helloWorldItem";
        this.metaData = helloWorldItemMetaData;
        this.createViewerItem = function (model, $element, content) {
            return new HelloWorldItemViewer(model, $element, content);
        }
    }
    return HelloWorldItem;
})();