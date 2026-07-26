import { usePassport } from '../context/PassportContext.jsx'

/**
 * Convenience hook for awarding XP.
 * Usage: const { addXP } = useXP()
 */
export function useXP() {
  const { addXP, passport, level } = usePassport()
  return { addXP, xp: passport.xp, level }
}
