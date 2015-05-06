/**
 * @ngdoc overview
 * @name _templ
 *
 * @description
 * This module defines a constant T, containing templates references.
 *
 * To access a template, inject the T constant and use the template key:
 *
 * - For feature-specific templates, the key is modulename_featurename_templatename,
 * for example, to access 'src/modules/myModule/features/myFeature/templates/myTemplate.html',
 * use **T.myModule_myFeature_myTemplate**
 *
 * - For directives template, the key is modulename_directivename_templatename,
 * for example, to access 'src/modules/myModule/common/directives/myDirective/myTemplate.html',
 * use **T.myModule_myDirective_myTemplate**
 *
 * <h2 style="color:red">This module is populated by the build system, do not modify</h2>
 */
angular.module('_templ', []).constant('T', {
/*##TEMPLATE_LIST##*/
});