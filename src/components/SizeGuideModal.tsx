import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ruler } from "lucide-react";

interface SizeGuideModalProps {
  category?: string;
}

const apparelSizes = [
  { size: "XS", chest: "34", waist: "28", length: "26" },
  { size: "S", chest: "36", waist: "30", length: "27" },
  { size: "M", chest: "38", waist: "32", length: "28" },
  { size: "L", chest: "40", waist: "34", length: "29" },
  { size: "XL", chest: "42", waist: "36", length: "30" },
  { size: "XXL", chest: "44", waist: "38", length: "31" },
];

const footwearSizes = [
  { uk: "5", us: "6", eu: "39", cm: "24.5" },
  { uk: "6", us: "7", eu: "40", cm: "25.5" },
  { uk: "7", us: "8", eu: "41", cm: "26" },
  { uk: "8", us: "9", eu: "42", cm: "27" },
  { uk: "9", us: "10", eu: "43", cm: "27.5" },
  { uk: "10", us: "11", eu: "44", cm: "28.5" },
  { uk: "11", us: "12", eu: "45", cm: "29.5" },
];

export const SizeGuideModal = ({ category }: SizeGuideModalProps) => {
  const isFootwear = category?.toLowerCase().includes("shoe") || category?.toLowerCase().includes("footwear");
  const defaultTab = isFootwear ? "footwear" : "apparel";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 text-xs text-secondary hover:underline font-medium">
          <Ruler size={12} />
          Size Guide
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Size Guide</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="apparel">Apparel</TabsTrigger>
            <TabsTrigger value="footwear">Footwear</TabsTrigger>
          </TabsList>

          <TabsContent value="apparel" className="mt-4">
            <p className="text-xs text-muted-foreground mb-3">All measurements in inches</p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-accent">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Size</th>
                    <th className="text-left px-4 py-3 font-semibold">Chest</th>
                    <th className="text-left px-4 py-3 font-semibold">Waist</th>
                    <th className="text-left px-4 py-3 font-semibold">Length</th>
                  </tr>
                </thead>
                <tbody>
                  {apparelSizes.map((row) => (
                    <tr key={row.size} className="border-t border-border">
                      <td className="px-4 py-2.5 font-medium">{row.size}</td>
                      <td className="px-4 py-2.5">{row.chest}"</td>
                      <td className="px-4 py-2.5">{row.waist}"</td>
                      <td className="px-4 py-2.5">{row.length}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              <strong>How to measure:</strong> For best fit, measure around the fullest part of your chest, your natural waistline, and from the shoulder to where you want the garment to end.
            </p>
          </TabsContent>

          <TabsContent value="footwear" className="mt-4">
            <p className="text-xs text-muted-foreground mb-3">Standard size conversion</p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-accent">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">UK</th>
                    <th className="text-left px-4 py-3 font-semibold">US</th>
                    <th className="text-left px-4 py-3 font-semibold">EU</th>
                    <th className="text-left px-4 py-3 font-semibold">Foot length (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {footwearSizes.map((row) => (
                    <tr key={row.uk} className="border-t border-border">
                      <td className="px-4 py-2.5 font-medium">{row.uk}</td>
                      <td className="px-4 py-2.5">{row.us}</td>
                      <td className="px-4 py-2.5">{row.eu}</td>
                      <td className="px-4 py-2.5">{row.cm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              <strong>How to measure:</strong> Stand on a piece of paper, trace your foot, then measure the longest distance from heel to toe.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SizeGuideModal;
