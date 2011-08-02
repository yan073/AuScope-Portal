Ext.namespace("CSWThemeFilter");

/**
 * An extension of CSWThemeFilter.BaseComponent to allow the selection of keywords
 */
CSWThemeFilter.Keywords = Ext.extend(CSWThemeFilter.BaseComponent, {
    keywordStore : null,
    keywordIDCounter : 0,

    constructor : function() {
        this.keywordStore = new Ext.data.Store({
            proxy    : new Ext.data.HttpProxy({url: 'getCSWKeywords.do'}),
            sortInfo : {field:'keyword',order:'ASC'},
            reader : new Ext.data.JsonReader({
                root            : 'data',
                id              : 'urn',
                successProperty : 'success',
                messageProperty : 'msg',
                fields          : [
                    'keyword',
                    'count'
                ]
            })
        });
        this.keywordStore.load();


        //Create our shell form (with columns preconfigured)
        var keywordsComponent = this;
        CSWThemeFilter.Keywords.superclass.constructor.call(this, {
            title : 'Keywords',
            collapsible : true,
            layout : 'column',
            items : [{
                columnWidth : 1.0,
                border : false,
                layout : 'anchor',
                bodyStyle:'padding:0px 0 0px 2px',
                items : []
            },{
                width : 25,
                border : false,
                bodyStyle:'padding:0px 0 0px 2px',
                items : []
            }, {
                width : 25,
                border : false,
                bodyStyle:'padding:0px 0 0px 2px',
                items : []
            }],
            listeners : {
                afterrender : function() {
                    keywordsComponent.handlerNewKeywordField();
                }
            }
        });
    },

    /**
     * Updates the visibility on all add/remove buttons
     */
    updateAddRemoveButtons : function() {
        var comboKeywordColumn = this.items.itemAt(0);
        var buttonRemoveColumn = this.items.itemAt(1);
        var buttonAddColumn = this.items.itemAt(2);

        var existingKeywordFields = comboKeywordColumn.items.getCount();

        for (var i = 0; i < existingKeywordFields; i++) {
            var addButton = buttonAddColumn.items.itemAt(i);
            var removeButton = buttonRemoveColumn.items.itemAt(i);

            //We can always remove so long as we have at least 1 keyword
            if (existingKeywordFields <= 1) {
                removeButton.hide();
            } else {
                removeButton.show();
            }
        }
    },

    /**
     * This function removes the buttons and keywords associated with button
     */
    handlerRemoveKeywordField : function(button, e) {
        var comboKeywordColumn = this.items.itemAt(0);
        var buttonRemoveColumn = this.items.itemAt(1);
        var buttonAddColumn = this.items.itemAt(2);

        //Figure out what component index we are attempting to remove
        var id = button.initialConfig.keywordIDCounter;
        var index = buttonRemoveColumn.items.findIndexBy(function(cmp) {
            return cmp === button;
        });

        //Remove that index from each column
        comboKeywordColumn.remove(comboKeywordColumn.getComponent(index));
        buttonRemoveColumn.remove(buttonRemoveColumn.getComponent(index));
        buttonAddColumn.remove(buttonAddColumn.getComponent(0)); //always remove spacers

        //Update our add/remove buttons
        this.updateAddRemoveButtons();
        this.doLayout();
    },

    /**
     * This function adds a new keyword form component to this field set
     */
    handlerNewKeywordField : function(button, e) {
        var comboKeywordColumn = this.items.itemAt(0);
        var buttonRemoveColumn = this.items.itemAt(1);
        var buttonAddColumn = this.items.itemAt(2);

        //Add our combo for selecting keywords
        comboKeywordColumn.add({
            xtype : 'combo',
            name : 'keyword',
            store : this.keywordStore,
            forceSelection : true,
            triggerAction : 'all',
            typeAhead : true,
            typeAheadDelay : 500,
            displayField : 'keyword',
            valueField : 'keyword',
            fieldLabel : 'Keyword',
            mode : 'local',
            anchor : '100%',
            keywordIDCounter : this.keywordIDCounter,
            //This template allows us to treat 'indent' levels differently
            tpl :  new Ext.XTemplate(
                    '<tpl for=".">',
                        '<div class="x-combo-list-item">',
                            '<tpl if="count&gt;=1">{keyword} <b>({count})</b></tpl>',
                            '<tpl if="count&lt;1">{keyword} <b>({count})</b></tpl>',
                        '</div>',
                    '</tpl>')
        });

        //We also need a button to remove this keyword field
        buttonRemoveColumn.add({
            xtype : 'button',
            iconCls : 'remove',
            width : 20,
            scope : this,
            keywordIDCounter : this.keywordIDCounter,
            handler : this.handlerRemoveKeywordField
        });

        //Because our add button will always be at the bottom of the list
        //we need to pad preceding elements with spacers
        if (buttonAddColumn.items.getCount() === 0) {
            buttonAddColumn.add({
                xtype : 'button',
                iconCls : 'add',
                width : 20,
                scope : this,
                handler : this.handlerNewKeywordField
            });
        } else {
            buttonAddColumn.insert(0, {
                xtype : 'spacer',
                width : 20,
                height : 22
            })
        }

        this.keywordIDCounter++;
        this.updateAddRemoveButtons();
        this.doLayout();

    },

    /**
     * Returns every keyword specified
     */
    getFilterValues : function() {
        var comboKeywordColumn = this.items.itemAt(0);
        var keywords = [];

        comboKeywordColumn.items.each(function(combo) {
            var value = keywords.getValue();
            if (value) {
                keywords.push(value);
            }
        });

        return {
            keyword : keywords
        };
    },

    /**
     * The Keywords component supports all URN's
     */
    supportsTheme : function(urn) {
        return true;
    }
});
