import { ISelectedUnit, IUpgradeGains, IUpgradeGainsItem, IUpgradeGainsMultiWeapon, IUpgradeGainsRule, IUpgradeGainsWeapon } from "../data/interfaces";
import { ListState } from "../data/listSlice";

export default class UnitService {

  public static getSelected(list: ListState): ISelectedUnit {
    return list.selectedUnitId === null || list.selectedUnitId === undefined
      ? null
      : list.units.filter(u => u.selectionId === list.selectedUnitId)[0];
  }

  public static getAllUpgrades(unit: ISelectedUnit, excludeModels: boolean): IUpgradeGains[] {
    return unit
      .selectedUpgrades
      .filter(u => excludeModels ? !u.isModel : true)
      .reduce((value, option) => value.concat(option.gains), []);
  }

  public static getAllUpgradedRules(unit: ISelectedUnit): IUpgradeGainsRule[] {
    const upgrades = this.getAllUpgrades(unit, true);

    const rules = upgrades.filter(u => u.type === "ArmyBookRule") || [];
    const rulesFromitems = upgrades
      .filter(u => u.type === "ArmyBookItem")
      .reduce((value, u: IUpgradeGainsItem) => value.concat(u.content.filter(c => c.type === "ArmyBookRule" || c.type === "ArmyBookDefense")), []) || [];

    const allRules: IUpgradeGainsRule[] = rules.concat(rulesFromitems) as IUpgradeGainsRule[];

    return allRules;
  }

  public static getAllUpgradeWeapons(unit: ISelectedUnit): (IUpgradeGainsWeapon | IUpgradeGainsMultiWeapon)[] {

    const isWeapon = u => u.type === "ArmyBookWeapon" || u.type === "ArmyBookMultiWeapon";
    const itemWeapons = this
      .getAllUpgradeItems(unit)
      .reduce((value, i) => value.concat(i.content.filter(isWeapon)), []);

    const all = this
      .getAllUpgrades(unit, false)
      .filter(isWeapon)
      .concat(itemWeapons) as (IUpgradeGainsWeapon | IUpgradeGainsMultiWeapon)[];

    return all;
  }

  public static getAllUpgradeItems(unit: ISelectedUnit): IUpgradeGainsItem[] {
    return this
      .getAllUpgrades(unit, false)
      .filter(u => u.type === "ArmyBookItem") as IUpgradeGainsItem[];
  }

  public static getSize(unit: ISelectedUnit) : number {
    const extraModelCount = unit.selectedUpgrades.filter(u => u.isModel).length;
    return unit.size + extraModelCount;
  }
}