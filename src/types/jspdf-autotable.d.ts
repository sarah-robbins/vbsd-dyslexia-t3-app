// types/jspdf-autotable.d.ts
declare module "jspdf" {
    interface jsPDF {
      autoTable: (options: {
        head: (string | number)[][];
        body: (string | number)[][];
      }) => void;
    }
  }
  