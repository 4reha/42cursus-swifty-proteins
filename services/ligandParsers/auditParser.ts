/**
 * Audit Parser
 * Parses audit/history data
 */

import { AuditEntry } from "@/types/ligand.types";
import { cleanValue, createHeaderMap } from "./cifUtils";

/**
 * Parse audit data from a loop structure
 */
export function parseAudit(headers: string[], rows: string[][]): AuditEntry[] {
  const audit: AuditEntry[] = [];
  const headerMap = createHeaderMap(headers);

  for (const row of rows) {
    const getValue = (field: string) => cleanValue(row[headerMap[field]]);

    audit.push({
      action: getValue("pdbx_chem_comp_audit.action_type") || undefined,
      date: getValue("pdbx_chem_comp_audit.date") || undefined,
      site: getValue("pdbx_chem_comp_audit.processing_site") || undefined,
    });
  }

  return audit;
}
