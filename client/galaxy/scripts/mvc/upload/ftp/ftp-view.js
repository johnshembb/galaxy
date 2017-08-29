/** Renders contents of the collection uploader */
define([ 'utils/utils', 'mvc/ui/ui-select',  'mvc/ui/ui-misc', 'mvc/upload/upload-model', 'mvc/upload/upload-ftp', 'mvc/upload/upload-extension', 'utils/uploadbox' ],
function( Utils, Select, Ui, UploadModel, UploadFtp, UploadExtension ) {
    return Backbone.View.extend({

        // contains upload row models
        collection : new UploadModel.Collection(),

        initialize : function( app ) {
            var self = this;
            this.app                = app;
            this.options            = app.options;
            this.list_extensions    = app.list_extensions;
            this.list_genomes       = app.list_genomes;
            this.ftp_upload_site    = app.currentFtp();
            this.setElement( this._template() );
            this.$info = this.$( '.upload-top-info' );

            // build ftp list view
            this.ftp_list = new UploadFtp({
                cls             : 'upload-ftp-full',
                collection      : this.collection,
                ftp_upload_site : this.ftp_upload_site,
                help_enabled    : false,
                onadd           : function( ftp_file ) {
                    self.collection.add({
                        id        : Utils.uid(),
                        file_mode : 'ftp',
                        file_size : ftp_file.size,
                        file_path : ftp_file.path,
                        enabled   : true
                    });
                },
                onremove: function( model_index ) {
                    self.collection.remove( model_index );
                }
            });
            this.$( '.upload-box' ).append( this.ftp_list.$el );

            // append buttons to dom
            this.btnStart   = new Ui.Button( {
                id       : 'btn-start',
                title    : 'Start',
                wait_cls : 'btn btn-info',
                onclick  : function() { self._eventStart() }
            } );
            this.btnRefresh = new Ui.Button( { id: 'btn-refresh', title: 'Reset', onclick: function() { self._eventReset() } } );
            this.btnClose   = new Ui.Button( { id: 'btn-close',   title: 'Close', onclick: function() { self.app.modal.hide() } } );
            _.each( [ this.btnRefresh, this.btnStart, this.btnClose ], function( button ) {
                self.$( '.upload-buttons' ).prepend( button.$el );
            });

            // select extension
            this.select_extension = new Select.View({
                css         : 'upload-footer-selection',
                container   : this.$( '.upload-footer-extension' ),
                data        : _.filter( this.list_extensions, function( ext ) { return !ext.composite_files } ),
                value       : this.options.default_extension,
                onchange    : function( extension ) { self.model.set( 'extension', extension ) }
            });

            // genome extension
            this.select_genome = new Select.View({
                css         : 'upload-footer-selection',
                container   : this.$( '.upload-footer-genome' ),
                data        : this.list_genomes,
                value       : this.options.default_genome,
                onchange    : function( genome ) { self.model.set( 'genome', genome ) }
            });

            // handle extension info popover
            this.$( '.upload-footer-extension-info' ).on( 'click', function( e ) {
                new UploadExtension({
                    $el         : $( e.target ),
                    title       : self.select_extension.text(),
                    extension   : self.select_extension.value(),
                    list        : self.list_extensions,
                    placement   : 'top'
                });
            }).on( 'mousedown', function( e ) { e.preventDefault() } );

            // listen to changes in collection
            this.listenTo( this.collection, 'add remove', this.render, this );
            this.render();
        },

        /** Start upload process */
        _eventStart: function() {
            var self = this;
            this.btnStart.wait();
            var data = {
                payload: {
                    'tool_id'       : 'upload1',
                    'history_id'    : this.app.currentHistory(),
                    'inputs'        : {}
                }
            }
            var inputs = {};
            inputs[ 'dbkey' ] = this.select_genome.value();
            inputs[ 'file_type' ] = this.select_extension.value();
            inputs[ 'files_0|type' ] = 'upload_dataset';
            inputs[ 'files_0|space_to_tab' ] = null;
            inputs[ 'files_0|to_posix_lines' ] = null;
            inputs[ 'files_0|ftp_files' ] = [];
            this.collection.each( function( model ) {
                model.set( 'status', 'running' );
                if ( model.get( 'file_size' ) > 0 ) {
                    inputs[ 'files_0|ftp_files' ].push( model.get( 'file_path' ) );
                }
            });
            data.payload.inputs = JSON.stringify( inputs );
            $.uploadpost({
                data     : data,
                url      : this.app.options.nginx_upload_path,
                success  : function( message ) { self._eventSuccess() },
                error    : function( message ) { self._eventError() }
            });
        },

        /** Reset handler */
        _eventReset: function() {
            this.collection.reset();
            this.ftp_list.render();
            this.render();
        },

        /** Refresh success state */
        _eventSuccess: function() {
            Galaxy.currHistoryPanel.refreshContents();
            this._eventReset();
            this.btnStart.unwait();
        },

        /** Show error message */
        _eventError: function() {
            this.$info.html( 'Some of the selected files have already been queued...please unselect them and try again.' );
            this.btnStart.unwait();
        },

        /** Set screen */
        render: function () {
            if ( this.collection.length > 0 ) {
                this.btnStart.enable();
                this.btnStart.$el.addClass( 'btn-primary' );
                this.$info.html( 'You added ' + this.collection.length + ' file(s) to the queue. Add more files or click \'Start\' to proceed.' );
            } else {
                this.btnStart.disable();
                this.btnStart.$el.removeClass( 'btn-primary' );
                this.$info.html( this.ftp_list.model.get( 'help_text' ) );
            }
        },

        /** Template */
        _template: function() {
            return  '<div class="upload-view-default">' +
                        '<div class="upload-top">' +
                            '<h6 class="upload-top-info"/>' +
                        '</div>' +
                        '<div class="upload-box upload-box-solid"/>' +
                        '<div class="upload-footer">' +
                            '<span class="upload-footer-title">Type (for all):</span>' +
                            '<span class="upload-footer-extension"/>' +
                            '<span class="upload-footer-extension-info upload-icon-button fa fa-search"/> ' +
                            '<span class="upload-footer-title">Genome (for all):</span>' +
                            '<span class="upload-footer-genome"/>' +
                        '</div>' +
                        '<div class="upload-buttons"/>' +
                    '</div>';
        }
    });
});
