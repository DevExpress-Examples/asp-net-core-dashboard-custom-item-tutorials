window.HelloWorldCustomItem = (function () {
    // #region svgIcon
    const svgIcon = '<svg id="helloWorldItemIcon" viewBox="0 0 24 24"><path stroke="#42f48f" fill="#42f48f" d="M12 2 L2 22 L22 22 Z" /></svg>';
    // #endregion
    // #region metadata
    const helloWorldItemMetaData = {
        customProperties: [{
            ownerType: DevExpress.Dashboard.Model.CustomItem,
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
    // #endregion
    // #region viewer
    class HelloWorldItemViewer extends DevExpress.Dashboard.CustomItemViewer {
        constructor(model, $container, options) {
            super(model, $container, options);
        }
        renderContent = function ($element, changeExisting) {
            var element = $element.jquery ? $element[0] : $element;
            element.innerText = this.getPropertyValue('customProperty');
        }
    }
    // #endregion
    // #region createItem
    class HelloWorldItem {
        constructor(dashboardControl) {
            DevExpress.Dashboard.ResourceManager.registerIcon(svgIcon);
            this.name = "helloWorldItem";
            this.metaData = helloWorldItemMetaData;
        }
        createViewerItem(model, $element, content) {
            return new HelloWorldItemViewer(model, $element, content);
        }
    }
    return HelloWorldItem;
    // #endregion
})();
