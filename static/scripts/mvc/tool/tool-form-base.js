define(["utils/utils","utils/deferred","mvc/ui/ui-misc","mvc/form/form-view","mvc/citation/citation-model","mvc/citation/citation-view"],function(a,b,c,d,e,f){return d.extend({initialize:function(a){var c=this;d.prototype.initialize.call(this,a),this.deferred=new b,a.inputs?this._buildForm(a):this.deferred.execute(function(b){c._buildModel(b,a,!0)}),a.listen_to_history&&parent.Galaxy&&parent.Galaxy.currHistoryPanel&&this.listenTo(parent.Galaxy.currHistoryPanel.collection,"change",function(){this.refresh()}),this.$el.on("remove",function(){c.remove()})},refresh:function(){var a=this;a.deferred.reset(),this.deferred.execute(function(b){a._updateModel(b)})},remove:function(){var a=this;this.$el.hide(),this.deferred.execute(function(){d.prototype.remove.call(a),Galaxy.emit.debug("tool-form-base::remove()","Destroy view.")})},_buildForm:function(b){var c=this;this.options=a.merge(b,this.options),this.options=a.merge({icon:b.icon,title:"<b>"+b.name+"</b> "+b.description+" (Galaxy Version "+b.version+")",operations:!this.options.hide_operations&&this._operations(),onchange:function(){c.refresh()}},this.options),this.options.customize&&this.options.customize(this.options),this.render(),this.options.collapsible||this.$el.append($("<div/>").addClass("ui-margin-top-large").append(this._footer()))},_buildModel:function(b,d,e){var f=this;this.options.id=d.id,this.options.version=d.version;var g="",h={};d.job_id?g=Galaxy.root+"api/jobs/"+d.job_id+"/build_for_rerun":(g=Galaxy.root+"api/tools/"+d.id+"/build",Galaxy.params&&Galaxy.params.tool_id==d.id&&(h=$.extend({},Galaxy.params),d.version&&(h.tool_version=d.version))),a.get({url:g,data:h,success:function(a){return a=a.tool_model||a,a.display?(f._buildForm(a),!e&&f.message.update({status:"success",message:"Now you are using '"+f.options.name+"' version "+f.options.version+", id '"+f.options.id+"'.",persistent:!1}),Galaxy.emit.debug("tool-form-base::initialize()","Initial tool model ready.",a),void b.resolve()):void(window.location=Galaxy.root)},error:function(a,d){var e=a&&a.err_msg||"Uncaught error.";401==d?window.location=Galaxy.root+"user/login?"+$.param({redirect:Galaxy.root+"?tool_id="+f.options.id}):f.$el.is(":empty")?f.$el.prepend(new c.Message({message:e,status:"danger",persistent:!0,large:!0}).$el):Galaxy.modal&&Galaxy.modal.show({title:"Tool request failed",body:e,buttons:{Close:function(){Galaxy.modal.hide()}}}),Galaxy.emit.debug("tool-form::initialize()","Initial tool model request failed.",a),b.reject()}})},_updateModel:function(b){var c=this,d=this.options.update_url||Galaxy.root+"api/tools/"+this.options.id+"/build",e={tool_id:this.options.id,tool_version:this.options.version,inputs:$.extend(!0,{},c.data.create())};this.wait(!0),Galaxy.emit.debug("tool-form-base::_updateModel()","Sending current state.",e),a.request({type:"POST",url:d,data:e,success:function(a){c.update(a.tool_model||a),c.options.update&&c.options.update(a),c.wait(!1),Galaxy.emit.debug("tool-form-base::_updateModel()","Received new model.",a),b.resolve()},error:function(a){Galaxy.emit.debug("tool-form-base::_updateModel()","Refresh request failed.",a),b.reject()}})},_operations:function(){var a=this,b=this.options,d=new c.ButtonMenu({icon:"fa-cubes",title:!b.narrow&&"Versions"||null,tooltip:"Select another tool version"});if(!b.sustain_version&&b.versions&&b.versions.length>1)for(var e in b.versions){var f=b.versions[e];f!=b.version&&d.addMenu({title:"Switch to "+f,version:f,icon:"fa-cube",onclick:function(){var c=b.id.replace(b.version,this.version),d=this.version;a.deferred.reset(),a.deferred.execute(function(b){a._buildModel(b,{id:c,version:d})})}})}else d.$el.hide();var g=new c.ButtonMenu({icon:"fa-caret-down",title:!b.narrow&&"Options"||null,tooltip:"View available options"});return b.biostar_url&&(g.addMenu({icon:"fa-question-circle",title:"Question?",tooltip:"Ask a question about this tool (Biostar)",onclick:function(){window.open(b.biostar_url+"/p/new/post/")}}),g.addMenu({icon:"fa-search",title:"Search",tooltip:"Search help for this tool (Biostar)",onclick:function(){window.open(b.biostar_url+"/local/search/page/?q="+b.name)}})),g.addMenu({icon:"fa-share",title:"Share",tooltip:"Share this tool",onclick:function(){prompt("Copy to clipboard: Ctrl+C, Enter",window.location.origin+Galaxy.root+"root?tool_id="+b.id)}}),Galaxy.user&&Galaxy.user.get("is_admin")&&g.addMenu({icon:"fa-download",title:"Download",tooltip:"Download this tool",onclick:function(){window.location.href=Galaxy.root+"api/tools/"+b.id+"/download"}}),b.requirements&&b.requirements.length>0&&g.addMenu({icon:"fa-info-circle",title:"Requirements",tooltip:"Display tool requirements",onclick:function(){!this.requirements_visible||a.portlet.collapsed?(this.requirements_visible=!0,a.portlet.expand(),a.message.update({persistent:!0,message:a._templateRequirements(b),status:"info"})):(this.requirements_visible=!1,a.message.update({message:""}))}}),b.sharable_url&&g.addMenu({icon:"fa-external-link",title:"See in Tool Shed",tooltip:"Access the repository",onclick:function(){window.open(b.sharable_url)}}),{menu:g,versions:d}},_footer:function(){var a=this.options,b=$("<div/>").append(this._templateHelp(a));if(a.citations){var c=$("<div/>"),d=new e.ToolCitationCollection;d.tool_id=a.id;var g=new f.CitationListView({el:c,collection:d});g.render(),d.fetch(),b.append(c)}return b},_templateHelp:function(a){var b=$("<div/>").addClass("ui-form-help").append(a.help);return b.find("a").attr("target","_blank"),b},_templateRequirements:function(a){var b=a.requirements.length;if(b>0){var c="This tool requires ";_.each(a.requirements,function(a,d){c+=a.name+(a.version?" (Version "+a.version+")":"")+(b-2>d?", ":d==b-2?" and ":"")});var d=$("<a/>").attr("target","_blank").attr("href","https://wiki.galaxyproject.org/Tools/Requirements").text("here");return $("<span/>").append(c+". Click ").append(d).append(" for more information.")}return"No requirements found."}})});
//# sourceMappingURL=../../../maps/mvc/tool/tool-form-base.js.map