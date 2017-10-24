(function () {
    var Ext = window.Ext4 || window.Ext;

Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    itemId: 'rallyApp',
    stateful: true,
    config: {
        defaultSettings: {
            iterationField: 'Theme',
            pointSize: 28
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
                    stateful: true,
                    stateId: 'selector' + Ext.id(),
                    storeConfig: {
                        fetch: ["Name", "StartDate", "EndDate", "ObjectID", "State", "PlannedVelocity",]
                    },
                    listeners: {
                        select: 
                            function() {
                                gApp = this.up('#rallyApp'); 
                                gApp._checkState();
                            },
                        ready:
                            function() {
                                gApp = this.up('#rallyApp'); 
                                gApp._checkState();
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
                model: 'Iteration',
                _isNotHidden: function(field) {
                    var blacklist = [
                        'ObjectUUID', 'ObjectID', 'Subscription', 'Workspace', 
                        'UserIterationCapacities', 'RevisionHistory', 'Project',
                        'VersionId'
                    ];
                    return !field.hidden && !_.contains(blacklist, field.name);
                },
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
        Ext.create('Rally.data.wsapi.Store', {
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
                    if (success) {
                        var hb = gApp.down('#textBox');
                        var fieldName = gApp.getSetting('iterationField');
                        var fieldData = data[0].get(fieldName) ? data[0].get(fieldName).toString() : 'Field Info Not Available';
                        
                        var pointSize = gApp.getSetting('pointSize');
                        if (hb && hb.down('#labelBox')) {hb.down('#labelBox').destroy();}
                        var label = hb.add( {
                            xtype: 'label',
                            itemId: 'labelBox',
                            html: fieldData
                        });
                        label.getEl().setStyle( 'font-size', pointSize + "px");
                    }
                }
            }
        },this);
        
    },

    launch: function() {
    }
});
}());