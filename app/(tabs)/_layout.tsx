import axios from 'axios';
import {
    router,
    Tabs
} from 'expo-router';
import React, {
    createContext,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { AppState, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';

type GoldPriceContextType = {
  goldPrice: number;
  loading: boolean;
  isMaintenanceMode: boolean;
};

export const GoldPriceContext = createContext<GoldPriceContextType>({
  goldPrice: 10000,
  loading: true,
  isMaintenanceMode: false,
});

const GoldPriceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [goldPrice, setGoldPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(false);
  const [usd, setUsd] = useState<number>(84);
  const [x, setX] = useState<number>(1);

  // Check maintenance mode from stopper API
  const checkMaintenanceMode = useCallback(async () => {
    try {
      const response = await axios.get('https://admin-pearl-kappa-34.vercel.app/api/stopper');
      const stopperData = response.data[0];
      
      if (stopperData && typeof stopperData.x === 'boolean') {
        setIsMaintenanceMode(stopperData.x);
        console.log('Maintenance Mode:', stopperData.x);
      }
    } catch (error) {
      console.error('Error fetching maintenance mode:', error);
      // Don't set maintenance mode on error, continue normal operation
    }
  }, []);

  // Fetch USD price and rate only once during initialization
  const initializeRates = useCallback(async () => {
    try {
      // Check maintenance mode first
      await checkMaintenanceMode();

      const [usdResponse, rateResponse] = await Promise.all([
        axios.get('https://open.er-api.com/v6/latest/USD'),
        axios.get('https://admin-pearl-kappa-34.vercel.app/api/rate')
      ]);

      const usdRate = usdResponse.data.rates.INR;
      const rateX = rateResponse.data[0].x;

      console.log('USD Rate:', usdRate);
      console.log('X Rate:', rateX);

      if (!usdRate || isNaN(usdRate)) {
        console.error('Invalid USD rate received:', usdRate);
        return { usd, x };
      }

      if (!rateX || isNaN(rateX)) {
        console.error('Invalid X rate received:', rateX);
        setX(1); // Fallback to default
        setUsd(usdRate);
        return { usd: usdRate, x: 1 };
      } else {
        setX(rateX);
        setUsd(usdRate);
        return { usd: usdRate, x: rateX };
      }
    } catch (error) {
      console.error('Error fetching initial rates:', error);
      return { usd, x };
    }
  }, [usd, x, checkMaintenanceMode]);

  const fetchGoldPrice = useCallback(async (currentUsd: number, currentX: number) => {
    try {
      console.log('Fetching gold price with USD:', currentUsd, 'and X:', currentX);
      const response = await axios.get('https://api.gold-api.com/price/XAU');
      const goldApiPrice = response.data.price;

      const calculatedPrice = (goldApiPrice * currentUsd * 0.337) + currentX;

      setGoldPrice(calculatedPrice);
      setLoading(false);
      console.log('Gold Price Updated:', calculatedPrice);
    } catch (error) {
      console.error('Error fetching gold price:', error);
      setLoading(false);
    }
  }, []);

  // Function to refresh all data when app becomes active
  const refreshData = useCallback(async () => {
    console.log('Refreshing data due to app state change...');
    setLoading(true);
    const rates = await initializeRates();
    if (rates && rates.usd && !isNaN(rates.usd) && rates.x && !isNaN(rates.x)) {
      await fetchGoldPrice(rates.usd, rates.x);
    }
  }, [initializeRates, fetchGoldPrice]);

  useEffect(() => {
    let mounted = true;
    let intervalId: number | null = null;

    const initialize = async () => {
      if (mounted) {
        setLoading(true);
        const rates = await initializeRates();
        console.log('Initialization complete. Rates:', rates);
        if (rates && rates.usd && !isNaN(rates.usd) && rates.x && !isNaN(rates.x)) {
          await fetchGoldPrice(rates.usd, rates.x);
        }
      }
    };

    const updateGoldPrice = async () => {
      if (mounted && !isNaN(usd) && !isNaN(x)) {
        await fetchGoldPrice(usd, x);
      }
    };

    const startInterval = () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      intervalId = setInterval(updateGoldPrice, 10000);
      console.log('Gold price update interval started');
    };

    const stopInterval = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log('Gold price update interval stopped');
      }
    };

    // Handle app state changes
    const handleAppStateChange = async (nextAppState: string) => {
      console.log('App state changed to:', nextAppState);

      if (nextAppState === 'active') {
        // App came to foreground - refresh data and restart interval
        await refreshData();
        startInterval();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App went to background - stop interval to save resources
        stopInterval();
      }
    };

    // Initialize the app
    initialize().then(() => {
      startInterval();
    });

    // Listen to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      mounted = false;
      stopInterval();
      subscription?.remove();
    };
  }, [initializeRates, fetchGoldPrice, usd, refreshData]);

  return (
    <GoldPriceContext.Provider value={{ goldPrice, loading, isMaintenanceMode }}>
      {children}
    </GoldPriceContext.Provider>
  );
};

export default function RootLayout() {
  return (
    <GoldPriceProvider>
      <MainLayout />
    </GoldPriceProvider>
  );
}

function MainLayout() {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  const navigateTo = (path: string) => {
    setDrawerVisible(false);
    router.push(path as any);
  };

  const drawerItems = [
    { icon: 'home', label: 'Home', route: '/', color: '#FFD700' },
    { icon: 'chart-line', label: 'Live Gold Rate', route: '/', color: '#FFD700' },
    { icon: 'calculator', label: 'Gold Calculator', route: '/calculator', color: '#4CAF50' },
    { icon: 'gold', label: 'Gold Coins', route: '/coin', color: '#FFA500' },
    { icon: 'necklace', label: 'Jewellery Collection', route: '/jewellery', color: '#E91E63' },
    { icon: 'account', label: 'My Profile', route: '/profile', color: '#2196F3' },
    { icon: 'bank', label: 'Bank Details', route: '/bankDetails', color: '#00BCD4' },
    { icon: 'information', label: 'About Us', route: '/about', color: '#9C27B0' },
    { icon: 'phone', label: 'Contact Us', route: '/contact', color: '#FF5722' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: Colors.background,
            },
            headerTintColor: Colors.fontColors,
            tabBarStyle: {
              display: 'none', // Hide default tab bar
            },
            tabBarActiveTintColor: Colors.accent,
            headerLeft: () => (
              <TouchableOpacity 
                onPress={toggleDrawer} 
                style={styles.menuButton}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="menu" size={28} color={Colors.fontColors} />
              </TouchableOpacity>
            ),
            headerTitle: () => (
              <View style={styles.logo}>
                <Image
                  style={styles.logoimage}
                  source={{
                    uri: "https://res.cloudinary.com/dzpsk7xch/image/upload/v1755331867/icon_2_rrrdio.png",
                  }}
                />
                <Text style={styles.logoText}>
                  Fancy Jewellers
                </Text>
              </View>
            ),
            headerRight: () => (
              <TouchableOpacity 
                onPress={() => router.push('/profile')} 
                style={styles.profileButton}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="account-circle" size={28} color={Colors.fontColors} />
              </TouchableOpacity>
            ),
          }}>
          <Tabs.Screen
            name="index"
            options={{
              tabBarLabel: 'Home',
              title: 'Home',
            }}
          />
          <Tabs.Screen
            name="calculator"
            options={{
              tabBarLabel: 'Calculator',
              title: 'Gold Calculator',
            }}
          />
          <Tabs.Screen
            name="coin"
            options={{
              tabBarLabel: 'Coins',
              title: 'Gold Coins',
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              tabBarLabel: 'Profile',
              title: 'Your Profile',
            }}
          />
          <Tabs.Screen
            name="contact"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="bankDetails"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="jewellery"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="about"
            options={{
              href: null,
            }}
          />
        </Tabs>

        {/* Custom Footer Navigation - Positioned at bottom */}
        <View style={styles.bottomNavContainer}>
          <View style={styles.bottomNav}>
            {/* Live Rate */}
            <TouchableOpacity
              style={styles.tabButton}
              activeOpacity={0.7}
              onPress={() => router.push('/')}
            >
              <View style={styles.footerItem}>
                <MaterialCommunityIcons 
                  name="chart-line" 
                  size={24} 
                  color={Colors.fontColors} 
                />
                <Text style={styles.footerText}>Live Rate</Text>
              </View>
            </TouchableOpacity>

            {/* Calculator */}
            <TouchableOpacity
              style={styles.tabButton}
              activeOpacity={0.7}
              onPress={() => router.push('/calculator')}
            >
              <View style={styles.footerItem}>
                <MaterialCommunityIcons 
                  name="calculator-variant" 
                  size={24} 
                  color={Colors.fontColors} 
                />
                <Text style={styles.footerText}>Calculator</Text>
              </View>
            </TouchableOpacity>

            {/* Jewellery - Center/Featured */}
            <TouchableOpacity
              style={[styles.tabButton, styles.featuredButton]}
              activeOpacity={0.7}
              onPress={() => router.push('/jewellery')}
            >
              <View style={styles.footerItem}>
                <MaterialCommunityIcons 
                  name="diamond-stone" 
                  size={30} 
                  color={Colors.fontColors} 
                />
                <Text style={[styles.footerText, styles.featuredText]}>Jewellery</Text>
              </View>
            </TouchableOpacity>

            {/* Gold Coins */}
            <TouchableOpacity
              style={styles.tabButton}
              activeOpacity={0.7}
              onPress={() => router.push('/coin')}
            >
              <View style={styles.footerItem}>
                <MaterialCommunityIcons 
                  name="gold" 
                  size={24} 
                  color={Colors.fontColors} 
                />
                <Text style={styles.footerText}>Coins</Text>
              </View>
            </TouchableOpacity>

            {/* Profile */}
            <TouchableOpacity
              style={styles.tabButton}
              activeOpacity={0.7}
              onPress={() => router.push('/profile')}
            >
              <View style={styles.footerItem}>
                <MaterialCommunityIcons 
                  name="account-circle" 
                  size={24} 
                  color={Colors.fontColors} 
                />
                <Text style={styles.footerText}>Profile</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Custom Drawer Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={drawerVisible}
        onRequestClose={toggleDrawer}
      >
        <Pressable 
          style={styles.drawerOverlay}
          onPress={toggleDrawer}
        >
          <Pressable 
            style={styles.drawerContainer}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.drawerBlur}>
              {/* Drawer Header */}
              <View style={styles.drawerHeader}>
                <Image
                  style={styles.drawerLogo}
                  source={{
                    uri: "https://res.cloudinary.com/dzpsk7xch/image/upload/v1755331867/icon_2_rrrdio.png",
                  }}
                />
                <Text style={styles.drawerTitle}>Fancy Jewellers</Text>
                <Text style={styles.drawerSubtitle}>Premium Gold & Jewellery</Text>
                <TouchableOpacity 
                  onPress={toggleDrawer} 
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="close" size={28} color={Colors.fontColors} />
                </TouchableOpacity>
              </View>

              {/* Drawer Items */}
              <ScrollView style={styles.drawerContent} showsVerticalScrollIndicator={false}>
                {drawerItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.drawerItem}
                    onPress={() => navigateTo(item.route)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.drawerIconContainer, { backgroundColor: `${item.color}20` }]}>
                      <MaterialCommunityIcons 
                        name={item.icon as any} 
                        size={24} 
                        color={item.color} 
                      />
                    </View>
                    <Text style={styles.drawerItemText}>{item.label}</Text>
                    <MaterialCommunityIcons 
                      name="chevron-right" 
                      size={24} 
                      color={Colors.textSecondary} 
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Drawer Footer */}
              <View style={styles.drawerFooter}>
                <Text style={styles.drawerFooterText}>Version 1.0.0</Text>
                <Text style={styles.drawerFooterSubtext}>Made with ♥ for luxury</Text>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  logo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  logoimage: {
    width: 35,
    height: 35,
    marginRight: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.fontColors,
  },
  menuButton: {
    marginLeft: 15,
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.backgroundMedium,
  },
  profileButton: {
    marginRight: 15,
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.backgroundMedium,
  },
  bottomNavContainer: {
    backgroundColor: Colors.background,
    borderTopWidth: 2,
    borderTopColor: Colors.fontColors,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    shadowColor: Colors.fontColors,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 15,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    backgroundColor: Colors.background,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  featuredButton: {
    backgroundColor: Colors.backgroundMedium,
    transform: [{ scale: 1.15 }],
    borderWidth: 2,
    borderColor: Colors.fontColors,
    borderRadius: 50,
    paddingVertical: 12,
    shadowColor: Colors.fontColors,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 10,
  },
  footerItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: Colors.fontColors,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  featuredText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  // Drawer Styles
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-start',
  },
  drawerContainer: {
    width: '85%',
    maxWidth: 380,
    height: '100%',
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: {
      width: 4,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 20,
  },
  drawerBlur: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  drawerHeader: {
    padding: 25,
    paddingTop: 50,
    backgroundColor: Colors.backgroundMedium,
    borderBottomWidth: 1,
    borderBottomColor: Colors.accent,
    alignItems: 'center',
  },
  drawerLogo: {
    width: 80,
    height: 80,
    marginBottom: 15,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.accent,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.fontColors,
    marginBottom: 5,
  },
  drawerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundDark,
  },
  drawerContent: {
    flex: 1,
    paddingVertical: 10,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.backgroundMedium,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  drawerIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  drawerItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.accent,
    backgroundColor: Colors.backgroundMedium,
    alignItems: 'center',
  },
  drawerFooterText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  drawerFooterSubtext: {
    fontSize: 11,
    color: Colors.fontColors,
    fontStyle: 'italic',
  },
});