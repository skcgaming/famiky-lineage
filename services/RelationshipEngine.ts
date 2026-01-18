
import { Member, Relation, RelationType } from '../types';

export class RelationshipEngine {
  private members: Map<string, Member>;
  private parents: Map<string, string[]>; // childId -> [parentIds]

  constructor(members: Member[], relations: Relation[]) {
    this.members = new Map(members.map(m => [m.id, m]));
    this.parents = new Map();

    relations.forEach(rel => {
      if (rel.type === RelationType.PARENT) {
        const existing = this.parents.get(rel.toId) || [];
        this.parents.set(rel.toId, [...existing, rel.fromId]);
      }
    });
  }

  private getAncestors(id: string): Map<string, number> {
    const path = new Map<string, number>();
    const queue: [string, number][] = [[id, 0]];
    
    while (queue.length > 0) {
      const [currentId, depth] = queue.shift()!;
      path.set(currentId, depth);
      const parentIds = this.parents.get(currentId) || [];
      parentIds.forEach(pId => queue.push([pId, depth + 1]));
    }
    return path;
  }

  public findRelationship(idA: string, idB: string): string {
    if (idA === idB) return "स्वयम्";

    const ancestorsA = this.getAncestors(idA);
    const ancestorsB = this.getAncestors(idB);

    let lcaId: string | null = null;
    let minCombinedDepth = Infinity;

    ancestorsA.forEach((depthA, commonId) => {
      if (ancestorsB.has(commonId)) {
        const combined = depthA + ancestorsB.get(commonId)!;
        if (combined < minCombinedDepth) {
          minCombinedDepth = combined;
          lcaId = commonId;
        }
      }
    });

    if (!lcaId) return "कुनै प्रत्यक्ष नाता भेटिएन";

    const up = ancestorsA.get(lcaId)!;
    const down = ancestorsB.get(lcaId)!;
    const targetMember = this.members.get(idB);

    // Simple heuristic-based mapping for demonstration
    if (up === 1 && down === 0) return targetMember?.gender === 'MALE' ? "बुबा" : "आमा";
    if (up === 0 && down === 1) return targetMember?.gender === 'MALE' ? "छोरा" : "छोरी";
    if (up === 1 && down === 1) return targetMember?.gender === 'MALE' ? "दाजु/भाइ" : "दिदी/बहिनी";
    if (up === 2 && down === 0) return targetMember?.gender === 'MALE' ? "हजुरबुबा" : "हजुरआमा";
    
    return `${up} पुस्ता माथि, ${down} पुस्ता तलको नाता`;
  }
}
