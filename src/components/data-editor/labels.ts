import { IVueI18n, TranslateResult } from 'vue-i18n';
import { SkillLevel } from '@/clients/resume-data';

export function getSkillLevelLabel(i18n: IVueI18n, level: SkillLevel): TranslateResult {
  switch (level) {
    case SkillLevel.Novice:
      return i18n.t('data-editor.label.skill-novice');
    case SkillLevel.Expert:
      return i18n.t('data-editor.label.skill-expert');
    default:
      throw new Error(`Unknow skill level '${level}'.`);
  }
}
