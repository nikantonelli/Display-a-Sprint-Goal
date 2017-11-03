(function () {
    var Ext = window.Ext4 || window.Ext;

Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    itemId: 'rallyApp',
    stateful: true,
    config: {
        defaultSettings: {
            recordType: 'Iteration',
            field: 'Theme',
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
            }
        },
        {
            xtype: 'container',
            itemId: 'textBox'
        }
    ],

    textHTML: null,

    _enterMainApp: function() {
        var me = this;

        if (this.down('#itemSelector')){
            this.down('#itemSelector').destroy();
        }
        var typeSelected = me.typeSelector;
        if (!typeSelected) {
            //Initialy, there will be no set up info, so ask user to initialise
            this.add(
                {
                    xtype: 'label', 
                    text:'Please set and save app settings for first use', 
                    margin: 50,
                    itemId: 'settingsLabel'
                }
            );
            return;
        }
        this.down('#headerBox').add(     //Done this way so that I can use the debugger to catch the object
        {
            xtype: typeSelected.comboBox,
            margin: '5 0 5 20',
            itemId: 'itemSelector',
            fieldLabel: 'Select Item: ',
            stateful: true,
            stateId: 'itemSelector' + Ext.id(),
            storeConfig: {
                autoLoad: true,
                model: typeSelected.value,
                fetch: typeSelected.fetchList,
            },
            listeners: {
                select: 
                    function() {
                        me._checkState(this.store.config.model, me);
                    },
                ready:
                    function() {
                        me._checkState(this.store.config.model, me);
                    }
            }
        });
    },

    typeSelector: null,

    getSettingsFields: function() {
        var me = this;
        var returned = [
            {
                xtype: 'rallycombobox',
                margin: '5 0 5 20',
                bubbleEvents: ['resetField'],
                name: 'recordType',
                fieldLabel: 'Artefact Type:',
                labelWidth:150,
                displayField: 'name',
                valueField: 'value',
                editable: false,
                storeType: 'Ext.data.Store',
                storeConfig: {
                    remoteFilter: false,
                    fields: ['name', 'value', 'comboBox', 'fetchList'],
                    data: [
                        { 
                            'name': 'Iteration', 
                            'value': 'Iteration', 
                            'comboBox' : 'rallyiterationcombobox',
                            'fetchList' : [
                                "Name", "StartDate", "EndDate", "ObjectID", "State", "PlannedVelocity"                                    
                            ] 
                        },
                        {   
                            'name': 'Release', 
                            'value': 'Release', 
                            'comboBox' : 'rallyreleasecombobox',
                            'fetchList' : [
                                "Name", "ObjectID", "State", "ReleaseDate", "ReleaseStartDate"
                            ]
                        },
                        { 
                            'name': 'Milestone', 
                            'value': 'Milestone', 
                            'comboBox' : 'rallymilestonecombobox',
                            'fetchList' : [
                                "Name", "ObjectID", "TargetDate"
                            ]  
                        }
                    ],
                },
                listeners: {
                    select: function(combo, records) {
                        me.typeSelector = records[0].data;
                        combo.fireEvent('resetField', records[0].get('value'), combo.context);

                    },
                    ready: function(combo) {
                        me.typeSelector = this.getRecord().data;
                        this.fireEvent('resetField', combo.value, combo.context);
                    }

                }
            },
            {
                name: 'field',
                fieldLabel: 'Field: ',
                xtype: 'rallyfieldcombobox',
                labelWidth: 150,
//                model: me.settings.recordType,
                margin: '5 0 5 20',
                _isNotHidden: function(field) {
                    var blacklist = [
                        'ObjectUUID', 'ObjectID', 'Subscription', 'Workspace', 
                        'UserIterationCapacities', 'RevisionHistory', 'Project',
                        'VersionId'
                    ];
                    return !field.hidden && !_.contains(blacklist, field.name);
                },
                handlesEvents: {
                    resetField: function (type, context) {
                     this.refreshWithNewModelType(type, context);
                    }
                }
            },
            {
                name: 'pointSize',
                fieldLabel: 'Font px: ',
                xtype: 'rallytextfield',
                labelWidth: 150,
                margin: '5 0 5 20',
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
        if ( this.down('#settingsLabel')) { this.down('#settingsLabel').destroy(); }
        this._enterMainApp();
    },

    _checkState: function(model, me) {
        if (!me.down('#itemSelector')) { return; }  //If we haven't set up app, then don't barf out here.

        //Get iteration into a store with all the fields
        var oid = Rally.util.Ref.getOidFromRef(me.down('#itemSelector').getValue());
        Ext.create('Rally.data.wsapi.Store', {
            model: model,
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
                        var hb = me.down('#textBox');
                        var fieldName = me.getSetting('field');
                        var fieldData = data[0].get(fieldName) ? data[0].get(fieldName).toString() : 'Field Info Not Available';
                        
                        var pointSize = me.getSetting('pointSize');
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
        this._enterMainApp();
    }
});
}());