// Define types for statistics data
export interface TopProduct {
  hang: number;
  ten: string;
  so_luong: number;
}

export interface RevenueDataset {
  data: number[];
  color: (opacity?: number) => string;
  strokeWidth: number;
}

export interface PieChartItem {
  ten: string;
  so_luong: number;
  mau_sac: string;
  mau_chu_chu_thich: string;
  co_chu_chu_thich: number;
  name?: string;
  population?: number;
  color?: string;
  legendFontColor?: string;
  legendFontSize?: number;
}

export interface TopSanPham {
  hang: number;
  ten: string;
  so_luong: number;
}

export interface StatisticsData {
  tong_hoa_don: number;
  tong_doanh_thu: number | string;
  tong_san_pham_ban: number;
  tong_thuc_uong_ban: number;
  tong_do_an_ban: number;
  thuc_uong_ban_chay: string | null;
  do_an_ban_chay: string | null;
  bieu_do_doanh_thu?: {
    nhan: string[];
    du_lieu: {
      data: number[];
      color: string;
      strokeWidth: number;
    }[];
    chu_thich: string[];
  };
  bieu_do_tron?: PieChartItem[];
  revenue_data?: {
    labels: string[];
    datasets: RevenueDataset[];
    legend: string[];
  };
  pie_chart_data?: any[];
  top_san_pham?: TopSanPham[];
} 