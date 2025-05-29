import axios from 'axios';
import { API_URL } from '@/services/getAPIUrl';
import { StatisticsData, PieChartItem } from '@/types/statistics';
import { format } from 'date-fns';
import { getAuthToken } from './authapi';

export const fetchStatistics = async (
  type: 'day' | 'week' | 'month',
  date: Date = new Date()
): Promise<StatisticsData> => {
  try {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const token = await getAuthToken();
    
    const response = await axios.get(`${API_URL}/statistics/`, {
      params: { type, date: formattedDate },
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    });
    
    // Transform API response to match our frontend structure if needed
    const data = response.data;
    
    // Map pie chart data if it exists
    if (data.bieu_do_tron) {
      data.pie_chart_data = data.bieu_do_tron.map((item: PieChartItem) => ({
        name: item.ten,
        population: item.so_luong,
        color: item.mau_sac,
        legendFontColor: item.mau_chu_chu_thich,
        legendFontSize: item.co_chu_chu_thich
      }));
    }
    
    // Map revenue data if it exists
    if (data.bieu_do_doanh_thu) {
      data.revenue_data = {
        labels: data.bieu_do_doanh_thu.nhan,
        datasets: data.bieu_do_doanh_thu.du_lieu.map((dataset: any) => ({
          data: dataset.data,
          color: (opacity = 1) => dataset.color,
          strokeWidth: dataset.strokeWidth
        })),
        legend: data.bieu_do_doanh_thu.chu_thich
      };
    }
    
    // Map top products if they exist
    if (data.top_san_pham) {
      data.top_products = data.top_san_pham.map((item: any) => ({
        rank: item.hang,
        name: item.ten,
        sales: item.so_luong
      }));
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};
