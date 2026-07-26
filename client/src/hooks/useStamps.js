import { usePassport } from '../context/PassportContext.jsx'

/**
 * Convenience hook for stamp operations.
 * Usage: const { addStamp, stamps } = useStamps()
 */
export function useStamps() {
  const { addStamp, passport } = usePassport()
  return { addStamp, stamps: passport.stamps }
}
