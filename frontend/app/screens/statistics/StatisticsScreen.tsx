import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

export default function StatisticsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('day'); // 'day', 'week', 'month'

  // Mock data cho biểu đồ đường
  const weeklyRevenueData = {
    labels: ['1', '2', '3', '4', '5', '6', '7'],
    datasets: [
      {
        data: [450, 950, 650, 700, 350, 650, 600],
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2
      }
    ],
    legend: ['Doanh thu']
  };

  const monthlyRevenueData = {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    datasets: [
      {
        data: [500, 700, 850, 950, 750, 650, 900, 1050, 950, 800, 700, 900],
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2
      }
    ],
    legend: ['Doanh thu']
  };

  // Mock data cho biểu đồ tròn
  const drinksPieChartData = [
    {
      name: '#001',
      population: 15,
      color: 'rgba(131, 167, 234, 1)',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    },
    {
      name: '#002',
      population: 10,
      color: 'rgba(255, 165, 180, 1)',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    },
    {
      name: '#003',
      population: 25,
      color: 'rgba(131, 227, 234, 1)',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    },
    {
      name: '#004',
      population: 30,
      color: 'rgba(255, 195, 100, 1)',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    },
    {
      name: '#005',
      population: 20,
      color: 'rgba(179, 134, 255, 1)',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    }
  ];

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726'
    },
    useShadowColorFromDataset: false
  };

  // Render tab content
  const renderDayTab = () => {
    return (
      <View style={styles.tabContent}>
        {/* Thống kê doanh thu */}
        <View style={styles.statisticsBox}>
          <Text style={styles.boxTitle}>Thống kê doanh thu</Text>
          <View style={styles.separator} />
          
          <Text style={styles.dateLabel}>Ngày 04/05/2025:</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tổng số hóa đơn bán ra:</Text>
            <Text style={styles.statValue}>10</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tổng số doanh thu:</Text>
            <Text style={styles.statValue}>1.000.000đ</Text>
          </View>
        </View>

        {/* Thống kê món ăn - đồ uống */}
        <View style={styles.statisticsBox}>
          <Text style={styles.boxTitle}>Thống kê món ăn - đồ uống</Text>
          <View style={styles.separator} />
          
          <Text style={styles.dateLabel}>Ngày 04/05/2025:</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tổng số món ăn - đồ uống bán ra:</Text>
            <Text style={styles.statValue}>30</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tổng số đồ uống bán ra:</Text>
            <Text style={styles.statValue}>20</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tổng số món ăn bán ra:</Text>
            <Text style={styles.statValue}>10</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Đồ uống bán chạy:</Text>
            <Text style={styles.statValue}>#001</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Món ăn bán chạy:</Text>
            <Text style={styles.statValue}>#010</Text>
          </View>
        </View>

        {/* Thống kê sách */}
        <View style={styles.statisticsBox}>
          <Text style={styles.boxTitle}>Thống kê sách</Text>
          <View style={styles.separator} />
          
          <Text style={styles.dateLabel}>Ngày 04/05/2025:</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tổng số sách được mượn:</Text>
            <Text style={styles.statValue}>20</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Sách được mượn nhiều:</Text>
            <Text style={styles.statValue}>#001</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderWeekTab = () => {
    return (
      <View style={styles.tabContent}>
        {/* Thống kê doanh thu */}
        <View style={styles.statisticsBox}>
          <Text style={styles.boxTitle}>Thống kê doanh thu</Text>
          <View style={styles.separator} />
          
          <Text style={styles.dateLabel}>Tuần 1 - Tháng 5:</Text>
          
          <LineChart
            data={weeklyRevenueData}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />

          <View style={[styles.statRow, styles.marginTop10]}>
            <Text style={styles.statLabel}>Tổng số hóa đơn bán ra:</Text>
            <Text style={styles.statValue}>30</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tổng số doanh thu:</Text>
            <Text style={styles.statValue}>5.000.000đ</Text>
          </View>
        </View>

        {/* Thống kê đồ uống */}
        <View style={styles.statisticsBox}>
          <Text style={styles.boxTitle}>Thống kê các sản phẩm bán chạy  </Text>
          <View style={styles.separator} />
          
          <Text style={styles.dateLabel}>Tuần 1 - Tháng 5:</Text>
          
          <View style={styles.pieChartContainer}>
            <PieChart
              data={drinksPieChartData}
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
      </View>
    );
  };

  const renderMonthTab = () => {
    return (
      <View style={styles.tabContent}>
        {/* Thống kê doanh thu tháng */}
        <View style={styles.statisticsBox}>
          <Text style={styles.boxTitle}>Thống kê doanh thu năm 2025</Text>
          <View style={styles.separator} />
          
          <LineChart
            data={monthlyRevenueData}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />

          <View style={[styles.statRow, styles.marginTop10]}>
            <Text style={styles.statLabel}>Tổng số hóa đơn bán ra:</Text>
            <Text style={styles.statValue}>320</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tổng số doanh thu:</Text>
            <Text style={styles.statValue}>25.000.000đ</Text>
          </View>
        </View>

        {/* Thống kê sản phẩm bán chạy theo tháng */}
        <View style={styles.statisticsBox}>
          <Text style={styles.boxTitle}>Top 5 sản phẩm bán chạy tháng 5/2025</Text>
          <View style={styles.separator} />
          
          <View style={styles.topProductRow}>
            <Text style={styles.topRank}>1</Text>
            <Text style={styles.topName}>Cà phê sữa #001</Text>
            <Text style={styles.topSales}>120 ly</Text>
          </View>
          
          <View style={styles.topProductRow}>
            <Text style={styles.topRank}>2</Text>
            <Text style={styles.topName}>Trà sữa trân châu #002</Text>
            <Text style={styles.topSales}>105 ly</Text>
          </View>
          
          <View style={styles.topProductRow}>
            <Text style={styles.topRank}>3</Text>
            <Text style={styles.topName}>Bánh mì gà #010</Text>
            <Text style={styles.topSales}>90 cái</Text>
          </View>
          
          <View style={styles.topProductRow}>
            <Text style={styles.topRank}>4</Text>
            <Text style={styles.topName}>Matcha đá xay #005</Text>
            <Text style={styles.topSales}>85 ly</Text>
          </View>
          
          <View style={styles.topProductRow}>
            <Text style={styles.topRank}>5</Text>
            <Text style={styles.topName}>Sinh tố xoài #007</Text>
            <Text style={styles.topSales}>78 ly</Text>
          </View>
        </View>

        {/* Doanh thu theo danh mục */}
        <View style={styles.statisticsBox}>
          <Text style={styles.boxTitle}>Doanh thu theo danh mục tháng 5/2025</Text>
          <View style={styles.separator} />
          
          <View style={styles.pieChartContainer}>
            <PieChart
              data={[
                {
                  name: 'Đồ uống',
                  population: 65,
                  color: 'rgba(131, 167, 234, 1)',
                  legendFontColor: '#7F7F7F',
                  legendFontSize: 12
                },
                {
                  name: 'Đồ ăn',
                  population: 30,
                  color: 'rgba(255, 165, 180, 1)',
                  legendFontColor: '#7F7F7F',
                  legendFontSize: 12
                },
                {
                  name: 'Khác',
                  population: 5,
                  color: 'rgba(131, 227, 234, 1)',
                  legendFontColor: '#7F7F7F',
                  legendFontSize: 12
                }
              ]}
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
      </View>
    );
  };

  // Render content dựa trên tab đang active
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
      
      {/* Tab Content */}
      <ScrollView style={styles.scrollView}>
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
  tabContent: {
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
});