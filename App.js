Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    itemId: 'rallyApp',

    config: {
        defaultSettings: {
            iterationField: 'Theme',
            pointSize: 18
        }
    },
    
    componentCls: 'app',
    items: [
        {
            xtype: 'container',
            itemId: 'headerBox',
            layout: {
                type: 'hbox'
            },
            items: [
                {
                    xtype: 'rallyiterationcombobox',
                    itemId: 'selector',
                    storeConfig: {
                        fetch: ["Name", "StartDate", "EndDate", "ObjectID", "State", "PlannedVelocity",]
                    },
                    listeners: {
                        select: 
                            function(selection) {
                                gApp = this.up('#rallyApp'); gApp._checkState();
                            },
                        ready:
                            function(selection) {
                                gApp = this.up('#rallyApp'); gApp._checkState();
                            }
                    }
                }
            ]
        },
        {
            xtype: 'container',
            itemId: 'textBox'
        }
    ],

    textHTML: null,

    getSettingsFields: function() {
        var returned = [
            {
                name: 'iterationField',
                xtype: 'rallyfieldcombobox',
                model: 'Iteration'
            },
            {
                name: 'pointSize',
                xtype: 'rallytextfield',
                validateOnChange: true,
                isValid: function() {
                    if (this.getValue() && parseInt(this.getValue())) {
                        return true;
                    }
                    else {
                        debugger;
                        return false;
                    }
                }
            }
        ];
        return returned;
    },

    onSettingsUpdate: function() {
        gApp._checkState();
    },

    _checkState: function() {
        
        //Get iteration into a store with all the fields
        var oid = Rally.util.Ref.getOidFromRef(gApp.down('#selector').getValue());
        var iterationStore = Ext.create('Rally.data.wsapi.Store', {
            model: 'Iteration',
            autoLoad: true,
            fetch: true,
            filters: [
                {
                    property: 'ObjectID',
                    operator: '=',
                    value: oid
                }
            ],
            listeners: {
                load: function(store,data,success) {
                    var hb = gApp.down('#textBox');
                    var fieldName = gApp.getSetting('iterationField');
                    var fieldData = data[0].get(fieldName);
                    var pointSize = gApp.getSetting('pointSize');
                    if (hb.down('#labelBox')) hb.down('#labelBox').destroy();
                    var label = hb.add( {
                        xtype: 'label',
                        itemId: 'labelBox',
                        html: fieldData
                    });
                    label.getEl().setStyle( 'font-size', pointSize + "px");
                }
            }
        },this);
        
    },

    launch: function() {
    }
});