
import React from 'react';

const ArchitectureDocs: React.FC = () => {
  return (
    <div className="space-y-6 text-gray-800 p-4">
      <section>
        <h3 className="text-xl font-bold border-b pb-2 mb-3">1. SQLite Database Schema (Room)</h3>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
          <pre>{`
@Entity(tableName = "members")
data class Member(
    @PrimaryKey val id: String,
    val name: String,         // Unicode support for Nepali
    val address: String?,
    val phone: String?,
    val photoUri: String?,
    val generation: Int,      // Crucial for Y-axis alignment
    val gender: String
)

@Entity(
    tableName = "relations",
    foreignKeys = [
        ForeignKey(entity = Member::class, parentColumns = ["id"], childColumns = ["fromId"]),
        ForeignKey(entity = Member::class, parentColumns = ["id"], childColumns = ["toId"])
    ]
)
data class Relation(
    @PrimaryKey val id: String,
    val fromId: String,
    val toId: String,
    val type: String // SPOUSE, PARENT
)
          `}</pre>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold border-b pb-2 mb-3">2. Performance Strategy (10,000+ Members)</h3>
        <ul className="list-disc ml-5 space-y-2">
          <li><strong>Paging 3:</strong> Use Room with Paging library to only load the visible cluster of the tree.</li>
          <li><strong>Canvas Drawing:</strong> Avoid <code>View</code> objects per member. Use a custom <code>SurfaceView</code> or <code>Canvas</code> to batch-render members as simple shapes/bitmaps.</li>
          <li><strong>Graph Pruning:</strong> For the UI, only render 3 generations from the "Focus Member" at any time.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold border-b pb-2 mb-3">3. Relationship Logic</h3>
        <p className="mb-2">
          Unlike a standard binary tree, human lineage is a <strong>Directed Acyclic Graph (DAG)</strong>.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 italic">
          "Husbands and wives share the same generation level and Y-coordinate. They are linked via a 'SPOUSE' relation type, which creates a horizontal edge. Children are connected via 'PARENT' edges from either spouse."
        </div>
      </section>
    </div>
  );
};

export default ArchitectureDocs;
