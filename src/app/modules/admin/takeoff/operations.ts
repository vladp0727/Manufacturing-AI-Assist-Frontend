import Konva from "konva";

export class Operations {
  private history: { action: string, node: Konva.Node, tableDataSnapshot?: any[], countTableDataSnapshot?: any[] }[] = [];

  constructor(private layer: Konva.Layer) {}

  push(action: string, node: Konva.Node, tableData?: any[], countTableData?: any[]): void {
    this.history.push({
      action,
      node: node.clone(),
      tableDataSnapshot: tableData ? JSON.parse(JSON.stringify(tableData)) : undefined,
      countTableDataSnapshot: countTableData ? JSON.parse(JSON.stringify(countTableData)) : undefined,
    });
  }

  undo(): { action: string, node: Konva.Node, tableDataSnapshot?: any[], countTableDataSnapshot?: any[] } | undefined {
    return this.history.pop();
  }

  clear(): void {
    this.history = [];
  }
}
