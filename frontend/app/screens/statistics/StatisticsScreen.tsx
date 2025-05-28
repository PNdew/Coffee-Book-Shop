import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, Platform, TextInput, FlatList } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { StatisticsData } from '@/types/statistics';
import { fetchStatistics } from '@/services/statisticapi';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
const { width: screenWidth } = Dimensions.get('window');

export default function StatisticsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const isWeb = Platform.OS === 'web';
  const [data, setData] = useState<StatisticsData>({
    tong_hoa_don: 0,
    tong_doanh_thu: 0,
    tong_san_pham_ban: 0,
    tong_thuc_uong_ban: 0,
    tong_do_an_ban: 0,
    thuc_uong_ban_chay: null,
    do_an_ban_chay: null,
    revenue_data: {
      labels: [],
      datasets: [{ data: [], color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, strokeWidth: 2 }],
      legend: ['Doanh thu'],
    },
    pie_chart_data: [],
    top_san_pham: [],
  });

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
    useShadowColorFromDataset: false,
  };

  useEffect(() => {
    loadData();
  }, [activeTab, selectedDate]);

  const loadData = async () => {
    try {
      const statisticsData = await fetchStatistics(activeTab as 'day' | 'week' | 'month', selectedDate);
      setData(statisticsData);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const onDateChange = (event: any, selected?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selected) {
      setSelectedDate(selected);
    }
  };

  const onWebDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    if (newDate) {
      setSelectedDate(new Date(newDate));
    }
  };

  // Formatted display date based on active tab
  const getDisplayDate = () => {
    switch(activeTab) {
      case 'day':
        return format(selectedDate, 'dd/MM/yyyy', { locale: vi });
      case 'week':
        return `Tuần ${Math.ceil(selectedDate.getDate() / 7)} - ${format(selectedDate, 'MM/yyyy', { locale: vi })}`;
      case 'month':
        return format(selectedDate, 'MM/yyyy', { locale: vi });
      default:
        return format(selectedDate, 'dd/MM/yyyy', { locale: vi });
    }
  };

  const renderDatePicker = () => {
    return (
      <View style={styles.datePickerContainer}>
        {isWeb ? (
          // Web date picker
          <View>
            <input
              type={activeTab === 'month' ? 'month' : 'date'}
              value={format(selectedDate, activeTab === 'month' ? 'yyyy-MM' : 'yyyy-MM-dd')}
              onChange={onWebDateChange}
              className="web-date-picker"
              style={{
                border: 'none',
                backgroundColor: '#fff',
                padding: '8px 15px',
                borderRadius: '20px',
                fontSize: '14px',
                color: '#333',
                fontWeight: '500',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                outline: 'none',
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            />
          </View>
        ) : (
          // Native mobile date picker
          <>
            {showDatePicker ? (
              <DateTimePicker
                value={selectedDate}
                mode={activeTab === 'day' ? 'date' : (activeTab === 'month' ? 'date' : 'date')}
                display="default"
                onChange={onDateChange}
              />
            ) : (
              <TouchableOpacity 
                style={styles.dateButton} 
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={18} color="#333" />
                <Text style={styles.dateButtonText}>{getDisplayDate()}</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    );
  };

  const renderDayTab = () => {
    return (
      <View>
        {/* Thống kê doanh thu */}
        <View style={styles.statisticsBox}>
          <Text style={styles.boxTitle}>Thống kê doanh thu</Text>
          <View style={styles.separator} />
          <Text style={styles.dateLabel}>Ngày {getDisplayDate()}:</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tổng số hóa đơn bán ra:</Text>
            <Text style={styles.statValue}>{data.tong_hoa_don}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tổng số doanh thu:</Text>
            <Text style={styles.statValue}>
              {typeof data.tong_doanh_thu === 'string' 
                ? parseInt(data.tong_doanh_thu).toLocaleString('vi-VN')
                : data.tong_doanh_thu.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>

        {/* Thống kê món ăn - đồ uống */}
        <View style={styles.statisticsBox}>
          <Text style={styles.boxTitle}>Thống kê món ăn - đồ uống</Text>
          <View style={styles.separator} />
          <Text style={styles.dateLabel}>Ngày {getDisplayDate()}:</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tổng số món ăn - đồ uống bán ra:</Text>
            <Text style={styles.statValue}>{data.tong_san_pham_ban}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tổng số đồ uống bán ra:</Text>
            <Text style={styles.statValue}>{data.tong_thuc_uong_ban}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tổng số món ăn bán ra:</Text>
            <Text style={styles.statValue}>{data.tong_do_an_ban}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Đồ uống bán chạy:</Text>
            <Text style={styles.statValue}>{data.thuc_uong_ban_chay || 'N/A'}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Món ăn bán chạy:</Text>
            <Text style={styles.statValue}>{data.do_an_ban_chay || 'N/A'}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderWeekTab = () => {
    return (
      <View>
        {/* Thống kê doanh thu */}
        <View style={styles.statisticsBox}>
          <Text style={styles.boxTitle}>Thống kê doanh thu</Text>
          <View style={styles.separator} />
          <Text style={styles.dateLabel}>{getDisplayDate()}:</Text>
          {data.revenue_data && data.revenue_data.labels && data.revenue_data.labels.length > 0 ? (
            <LineChart
              data={data.revenue_data}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          ) : (
            <Text style={styles.noDataText}>Không có dữ liệu biểu đồ</Text>
          )}
          <View style={[styles.statRow, styles.marginTop10]}>
            <Text style={styles.statLabel}>Tổng số hóa đơn bán ra:</Text>
            <Text style={styles.statValue}>{data.tong_hoa_don}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tổng số doanh thu:</Text>
            <Text style={styles.statValue}>
              {typeof data.tong_doanh_thu === 'string' 
                ? parseInt(data.tong_doanh_thu).toLocaleString('vi-VN')
                : data.tong_doanh_thu.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>

        {/* Thống kê đồ uống */}
        <View style={styles.statisticsBox}>
          <Text style={styles.boxTitle}>Thống kê các sản phẩm bán chạy</Text>
          <View style={styles.separator} />
          <Text style={styles.dateLabel}>{getDisplayDate()}:</Text>
          <View style={styles.pieChartContainer}>
            {data.pie_chart_data && data.pie_chart_data.length > 0 ? (
              <PieChart
                data={data.pie_chart_data}
                width={screenWidth - 60}
                height={200}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            ) : (
              <Text style={styles.noDataText}>Không có dữ liệu biểu đồ</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderMonthTab = () => {
    return (
      <View>
        {/* Thống kê doanh thu tháng */}
        <View style={styles.statisticsBox}>
          <Text style={styles.boxTitle}>Thống kê doanh thu năm {selectedDate.getFullYear()}</Text>
          <View style={styles.separator} />
          {data.revenue_data && data.revenue_data.labels && data.revenue_data.labels.length > 0 ? (
            <LineChart
              data={data.revenue_data}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          ) : (
            <Text style={styles.noDataText}>Không có dữ liệu biểu đồ</Text>
          )}
          <View style={[styles.statRow, styles.marginTop10]}>
            <Text style={styles.statLabel}>Tổng số hóa đơn bán ra:</Text>
            <Text style={styles.statValue}>{data.tong_hoa_don}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tổng số doanh thu:</Text>
            <Text style={styles.statValue}>
              {typeof data.tong_doanh_thu === 'string' 
                ? parseInt(data.tong_doanh_thu).toLocaleString('vi-VN')
                : data.tong_doanh_thu.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>

        {/* Thống kê sản phẩm bán chạy theo tháng */}
        {data.top_san_pham && data.top_san_pham.length > 0 && (
          <View style={styles.statisticsBox}>
            <Text style={styles.boxTitle}>Top 5 sản phẩm bán chạy tháng {selectedDate.getMonth() + 1}</Text>
            <View style={styles.separator} />
            {data.top_san_pham.map((item, index) => (
              <View style={styles.topProductRow} key={index}>
                <Text style={styles.topRank}>{item.hang}</Text>
                <Text style={styles.topName}>{item.ten}</Text>
                <Text style={styles.topSales}>{item.so_luong} ly</Text>
              </View>
            ))}
          </View>
        )}

        {/* Doanh thu theo danh mục */}
        {data.pie_chart_data && data.pie_chart_data.length > 0 && (
          <View style={styles.statisticsBox}>
            <Text style={styles.boxTitle}>Doanh thu theo danh mục tháng {selectedDate.getMonth() + 1}</Text>
            <View style={styles.separator} />
            <View style={styles.pieChartContainer}>
              <PieChart
                data={data.pie_chart_data}
                width={screenWidth - 60}
                height={200}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'day':
        return renderDayTab();
      case 'week':
        return renderWeekTab();
      case 'month':
        return renderMonthTab();
      default:
        return renderDayTab();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('../HomeScreen')}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Quản lý thống kê</Text>
        </View>
      </View>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'day' && styles.activeTab]}
          onPress={() => setActiveTab('day')}
        >
          <Text style={[styles.tabText, activeTab === 'day' && styles.activeTabText]}>Ngày</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'week' && styles.activeTab]}
          onPress={() => setActiveTab('week')}
        >
          <Text style={[styles.tabText, activeTab === 'week' && styles.activeTabText]}>Tuần</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'month' && styles.activeTab]}
          onPress={() => setActiveTab('month')}
        >
          <Text style={[styles.tabText, activeTab === 'month' && styles.activeTabText]}>Tháng</Text>
        </TouchableOpacity>
      </View>
      {/* Date Picker */}
      {renderDatePicker()}
      
      {/* Tab Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },
  header: {
    backgroundColor: '#ffb6b9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
    borderRadius: 20,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f0',
    justifyContent: 'center',
    paddingTop: 15,
    paddingBottom: 10,
  },
  tab: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 50,
    marginHorizontal: 5,
    backgroundColor: '#e0e0e0',
  },
  activeTab: {
    backgroundColor: '#ff4757',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  activeTabText: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 15,
  },
  statisticsBox: {
    backgroundColor: '#e8e8e8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  boxTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
    color: '#555',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#333',
    flex: 3,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  chart: {
    backgroundColor: '#fff',
    marginVertical: 8,
    borderRadius: 16,
  },
  pieChartContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  marginTop10: {
    marginTop: 10,
  },
  topProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 8,
    padding: 10,
    borderRadius: 5,
  },
  topRank: {
    width: 25,
    height: 25,
    lineHeight: 24,
    borderRadius: 15,
    backgroundColor: '#ff4757',
    color: '#fff',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginRight: 10,
    fontWeight: 'bold',
  },
  topName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  topSales: {
    width: 60,
    fontSize: 14,
    color: '#ff4757',
    textAlign: 'right',
    fontWeight: '500',
  },
  noDataText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  datePickerContainer: {
    padding: 10,
    alignItems: 'center',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  dateButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  calendarIcon: {
    marginRight: 8,
  },
});