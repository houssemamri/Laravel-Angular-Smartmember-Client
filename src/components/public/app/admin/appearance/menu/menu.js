var app = angular.module("app");

app.config(function($stateProvider){
    $stateProvider
        .state("public.app.admin.appearance.menu",{
            url: "/menu/:id?",
            templateUrl: "/templates/components/public/app/admin/appearance/menu/menu.html",
            controller: "MenuItemModalInstanceCtrl",
            // resolve: {
            //     loadPlugin: function ($ocLazyLoad) {
            //         return $ocLazyLoad.load([
            //             {
            //                 files: ['bower/ui-iconpicker/dist/scripts/ui-iconpicker.min.js']
            //             }
            //         ]);
            //     }
            // }
        })
});

