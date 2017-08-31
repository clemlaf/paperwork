angular.module('paperworkNotes').factory('NotebooksService',
  function($rootScope, $http, NetService, StatusNotifications) {
    var paperworkNotebooksServiceFactory = {};

    // paperworkNotebooksServiceFactory.selectedNotebookId = 0;

    paperworkNotebooksServiceFactory.createNotebook = function(data, callback) {
      NetService.apiPost('/notebooks', data, callback);
    };

    paperworkNotebooksServiceFactory.updateNotebook = function(notebookId, data, callback) {
      NetService.apiPut('/notebooks/' + notebookId, data, callback);
    };

    paperworkNotebooksServiceFactory.shareNotebook = function(notebookId, toUserId, toUMASK, propagationToNotes, callback) {
      NetService.apiPost('/notebooks/' + notebookId+'/share',{'ids':toUserId,'umasks':toUMASK, 'propagate':propagationToNotes}, function(status,data){
        if (status==200) {
          if(typeof callback != "undefined") {
            callback(notebookId);
            }
          StatusNotifications.sendStatusFeedback("success", "notebook_share_success");
        }else{
          StatusNotifications.sendStatusFeedback("error", "notebook_share_fail");
        }
      });
    };

    paperworkNotebooksServiceFactory.updateTag = function(tagId, data, callback) {
      NetService.apiPut('/tags/' + tagId, data, callback);
    };

    paperworkNotebooksServiceFactory.nestTag = function(tagId, parentTagId, callback) {
      NetService.apiGet('/tags/' + tagId+ '/' + parentTagId, callback);
    };

    paperworkNotebooksServiceFactory.deleteNotebook = function(notebookId, callback) {
      NetService.apiDelete('/notebooks/' + notebookId, callback);
    };

    paperworkNotebooksServiceFactory.removeNotebookFromCollection = function(notebookId, callback) {
      NetService.apiGet('/notebooks/'+ notebookId + '/remove-collection', callback);
    };

    paperworkNotebooksServiceFactory.deleteTag = function(tagId, callback) {
      NetService.apiDelete('/tags/' + tagId, callback);
    };

    paperworkNotebooksServiceFactory.getCalendar = function(callback) {
      NetService.apiGet('/calendar', function(status, data) {
        if(status == 200) {
          callback(data.response);
        }
      });
    };

    paperworkNotebooksServiceFactory.getNotebooks = function() {
      NetService.apiGet('/notebooks', function(status, data) {
        if(status == 200) {
          $rootScope.notebooks = data.response;
        }
      });
    };

    paperworkNotebooksServiceFactory.getNotebookById = function(notebookId) {
      NetService.apiGet('/notebooks/' + notebookId, function(status, data) {
        if(status == 200) {
          $rootScope.notebook = data.response;
        }
      });
    };

    paperworkNotebooksServiceFactory.getNotebookByIdLocal = function(notebookId) {
      var i = 0, l = $rootScope.notebooks.length;
      for(i = 0; i < l; i++) {
        if($rootScope.notebooks[i].id == notebookId) {
          return $rootScope.notebooks[i];
        }
      }
      return null;
    };

    paperworkNotebooksServiceFactory.getNotebookShortcuts = function() {
      NetService.apiGet('/shortcuts', function(status, data) {
        if(status == 200) {
          $rootScope.shortcuts = data.response;
        }
      });
    };

    paperworkNotebooksServiceFactory.getShortcutByNotebookIdLocal = function(notebookId) {
      var i = 0, l = $rootScope.shortcuts.length;
      for(i = 0; i < l; i++) {
        if($rootScope.shortcuts[i].id == notebookId) {
          return $rootScope.shortcuts[i];
        }
      }
      return null;
    };

    paperworkNotebooksServiceFactory.getTags = function() {
        NetService.apiGet('/tags', function(status, data) {
            if(status == 200) {
                tmp=[];//i store the collapsed info
                angular.forEach($rootScope.tags,function(tag,key){
                    if(typeof(tag.collapsed)!="undefined"){
                        tmp[tag.id]=tag.collapsed;
                    }else{
                        tmp[tag.id]=false;
                    }
                });
                $rootScope.tags = data.response;//updating the tags
                angular.forEach($rootScope.tags, function(tag,key){
                    if(typeof(tmp[tag.id])!="undefined"){
                        tag.collapsed=tmp[tag.id];
                    }else{
                        tag.collapsed=false;
                    }
                });
            }
        });
    };

    paperworkNotebooksServiceFactory.createCollection = function(data, callback) {
        NetService.apiPost('/notebooks/collections', data, callback);
    };

    paperworkNotebooksServiceFactory.updateCollection = function(collectionId, data, callback) {
        NetService.apiPost('/notebooks/collections/' + collectionId + '/edit', data, callback);
    };

    paperworkNotebooksServiceFactory.getUsers = function (notebookId, propagationToNotes, update){
      if(typeof $rootScope.i18n != "undefined")
      $rootScope.umasks=[{'name':$rootScope.i18n.keywords.not_shared, 'value':0},
      {'name':$rootScope.i18n.keywords.read_only, 'value':4},
      {'name':$rootScope.i18n.keywords.read_write, 'value':6}];
      $rootScope.showWarningNotebook=false;
      $rootScope.showWarningNotes=false;
      NetService.apiGet('/users/notebooks/'+notebookId, function(status, data) {
        if(status == 200) {
          if(update && $rootScope.users.length==data.response.length){
            angular.forEach($rootScope.users,function(value,key){
              value['owner']=data.response[key]['owner'];
            });
          }else{
            $rootScope.users = data.response;
          }
          angular.forEach($rootScope.users, function(value,key){
            if (value['is_current_user'] && ! value['owner']) {
              $rootScope.showWarningNotebook=true;
            }
          });
        }
        if (propagationToNotes) {
          noteId=[];
          angular.forEach($rootScope.notes, function(value,key){
            noteId.push(value['id']);
          });
          NetService.apiGet('/users/'+noteId, function(status, data){
            if (status==200) {
              angular.forEach($rootScope.users, function(value,key){
                value['owner']=data.response[key]['owner'];
                if (value['is_current_user'] && ! value['owner']) {
                  $rootScope.showWarningNotes=true;
                }
              });
            }
          });
        }
      });
    };


    return paperworkNotebooksServiceFactory;
  });
