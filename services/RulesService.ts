import { ISpecialRule } from "../data/interfaces";

export default class RulesService {
    public static displayName(rule: ISpecialRule) {
        return rule.name
            + ((rule.rating && parseInt(rule.rating) > 0) ? `(${(rule.name === "Defense" || rule.modify ? "+" : "") + rule.rating})` : "")
            + (rule.condition ? ` ${rule.condition}` : "");
    }
}