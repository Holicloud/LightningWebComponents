/**
 * @description Controller class to provide component metadata for Lightning Web Components.
 */
public with sharing class ComponentReferenceController {
  /**
   * @description Metadata for components.
   * @return List<Component__mdt> list of component examples
   */
  @AuraEnabled(cacheable=true)
  public static List<Component__mdt> getComponents() {
    return Component__mdt.getAll().values();
  }

  /**
   * @description Metadata for component examples.
   * @return List<ComponentExample__mdt> list of component examples
   */
  @AuraEnabled(cacheable=true)
  public static List<ComponentExample__mdt> getExamples() {
    return ComponentExample__mdt.getAll().values();
  }
}
