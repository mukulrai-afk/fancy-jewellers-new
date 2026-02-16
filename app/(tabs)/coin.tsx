// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import React, { useContext, useEffect, useRef, useState } from 'react';
// import {
//   Animated,
//   Dimensions,
//   Platform,
//   RefreshControl,
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   View
// } from 'react-native';
// import { GoldPriceContext } from './_layout';

// const { width } = Dimensions.get('window');

// const Coin: React.FC = () => {
//   const { goldPrice: goldPriceFromContext, loading: contextLoading } = useContext(GoldPriceContext);
//   const [goldPrice, setGoldPrice] = useState<number>(goldPriceFromContext);
//   const [displayGold, setDisplayGold] = useState<boolean>(false);
//   const [refreshing, setRefreshing] = useState<boolean>(false);
//   const [priceChange, setPriceChange] = useState({ value: 0, isPositive: true });
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const prevPrice = useRef(goldPrice);

//   useEffect(() => {
//     if (goldPriceFromContext !== prevPrice.current) {
//       // animatePrice(goldPriceFromContext > prevPrice.current);
//       setPriceChange({
//         value: goldPriceFromContext - prevPrice.current,
//         isPositive: goldPriceFromContext > prevPrice.current
//       });
//       prevPrice.current = goldPriceFromContext;
//       setGoldPrice(goldPriceFromContext);
//     }
//   }, [goldPriceFromContext]);

//   const onRefresh = React.useCallback(() => {
//     setRefreshing(true);
//     setTimeout(() => setRefreshing(false), 1500);
//   }, []);

  

//   const CoinCard = ({ weight, price }: { weight: number; price: number }) => (
//     <View   style={styles.coinCard}>
//       <View style={styles.coinLeftContent}>
//         <MaterialCommunityIcons name="circle-multiple" size={24} color="#E7B858" />
//         <Text style={styles.coinWeight}>{weight}g</Text>
//       </View>
//       <View style={styles.coinRightContent}>
//         <Text style={styles.coinPrice}>₹{price.toLocaleString('en-IN', {
//           maximumFractionDigits: 2,
//           minimumFractionDigits: 2
//         })}</Text>
//         <MaterialCommunityIcons name="chevron-right" size={20} color="#E7B858" />
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" />
      
//       <ScrollView
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//         showsVerticalScrollIndicator={false}
//       >
//       {/* <View style={styles.header}>

      
        
//       </View> */}

      
        

//         <View>
//             <Text style={styles.headerTitle}>Coins</Text>
//         </View>
          

        
//           <View style={styles.coinContainer}>
//             {[1, 2, 5, 10, 20, 50, 100].map((weight) => (
//               <CoinCard
//                 key={weight}
//                 weight={weight}
//                 price={(weight * goldPrice * 0.1005 + (weight >= 100 ? 2000: weight >= 50 ? 1700 : 
//                   weight >= 20 ? 1400 : 
//                   weight >= 10 ? 1100 :
//                   weight >= 5 ? 800 : 500)) * 1.03}
//               />
//             ))}
//           </View>
        
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
//   },
//   header: {
//     padding: 2,
//     paddingTop: 5,
//   },
//   image: {
//     width: '30%',
//     height: 150,
//     alignSelf: 'center',
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     textAlign: 'center',
//   },
//   headerSubtitle: {
//     fontSize: 16,
//     textAlign: 'center',
//     marginTop: 4,
//     marginBottom:12
//   },
//   mainPriceCard: {
//     margin: 20,
//     padding: 20,
//     borderRadius: 20,
//   },
//   currentPrice: {
//     fontSize: 36,
//     fontWeight: '700',
//     textAlign: 'center',
//   },
//   priceChangeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 2,
//     paddingHorizontal: 4,
//     borderRadius: 20,
//     marginTop: 12,
//     alignSelf: 'center',
//   },
//   priceChangeText: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   segmentContainer: {
//     flexDirection: 'row',
//     marginHorizontal: 20,
    
//     borderRadius: 12,
//     padding: 4,
//   },
//   segmentButton: {
//     flex: 1,
//     paddingVertical: 12,
//     alignItems: 'center',
//     borderRadius: 8,
//   },
  
//   segmentText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
  
//   karatContainer: {
//     padding: 20,
//   },
//   karatCard: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 15,
//     borderRadius: 16,
//     marginBottom: 12,
//     overflow: 'hidden',
//   },
//   karatTitle: {
//     fontSize: 18,
//     fontWeight: '600',
    
//   },
//   karatPrice: {
//     fontSize: 18,
//     fontWeight: '700',
//   },
//   coinContainer: {
//     padding: 20,
//   },
//   coinCard: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     borderRadius: 16,
//     marginBottom: 12,
//     overflow: 'hidden',
//   },
//   coinLeftContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   coinWeight: {
//     fontSize: 16,
//     fontWeight: '600',
    
//     marginLeft: 12,
//   },
//   coinRightContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   coinPrice: {
//     fontSize: 16,
//     fontWeight: '700',
//     marginRight: 8,
//   },
// });

// export default Coin;

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { GoldPriceContext } from './_layout';

const { width, height } = Dimensions.get('window');

export default function Coin() {
  const { goldPrice: goldPriceFromContext, loading: contextLoading, isMaintenanceMode } = useContext(GoldPriceContext);
  const [goldPrice, setGoldPrice] = useState<number>(goldPriceFromContext);
  const [displayGold, setDisplayGold] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [priceChange, setPriceChange] = useState({ value: 0, isPositive: true });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnims = useRef([1, 2, 5, 10, 20, 50, 100].map(() => new Animated.Value(1))).current;
  const prevPrice = useRef(goldPrice);

  useEffect(() => {
    if (goldPriceFromContext !== prevPrice.current) {
      setPriceChange({
        value: goldPriceFromContext - prevPrice.current,
        isPositive: goldPriceFromContext > prevPrice.current
      });
      prevPrice.current = goldPriceFromContext;
      setGoldPrice(goldPriceFromContext);
    }
  }, [goldPriceFromContext]);

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      })
    ]).start();

    // Staggered animation for cards
    const cardAnimations = scaleAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      })
    );

    Animated.stagger(50, cardAnimations).start();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    
    // Reset and replay animations
    scaleAnims.forEach(anim => anim.setValue(0.8));
    const refreshAnimations = scaleAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      })
    );
    
    Animated.stagger(30, refreshAnimations).start();
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const animateCardPress = (index: number) => {
    const anim = scaleAnims[index];
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      })
    ]).start();
  };

  const CoinCard = ({ weight, price, index }: { weight: number; price: number; index: number }) => (
    <Animated.View
      style={[
        styles.coinCard,
        {
          transform: [{ scale: scaleAnims[index] }],
          opacity: fadeAnim,
        }
      ]}
    >
      <TouchableOpacity
        style={styles.coinCardTouchable}
        onPress={() => animateCardPress(index)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['rgba(231, 184, 88, 0.1)', 'rgba(255, 215, 0, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.coinCardGradient}
        >
          <BlurView intensity={20} style={styles.coinCardBlur}>
            <View style={styles.coinLeftContent}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons 
                  name="circle-multiple" 
                  size={28} 
                  color="#FFD700" 
                  style={styles.coinIcon}
                />
                <View style={styles.iconGlow} />
              </View>
              <View>
                <Text style={styles.coinWeight}>{weight}g</Text>
                <Text style={styles.coinWeightSubtitle}>Gold Coin</Text>
              </View>
            </View>
            <View style={styles.coinRightContent}>
              <View style={styles.priceContainer}>
                <Text style={styles.coinPrice}>
                  ₹{price.toLocaleString('en-IN', {
                    maximumFractionDigits: 0,
                    minimumFractionDigits: 0
                  })}
                </Text>
                <Text style={styles.coinPriceSubtitle}>Inc. all charges</Text>
              </View>
              <View style={styles.chevronContainer}>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#FFD700" />
              </View>
            </View>
          </BlurView>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const FloatingHeader = () => (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <MaterialCommunityIcons name="gold" size={32} color="#FFD700" />
            <Text style={styles.headerTitle}>Premium Coins</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Crafted with 99.9% pure gold
          </Text>
          
          {!isMaintenanceMode && goldPrice && (
            <View style={styles.liveRateContainer}>
              <View style={styles.liveDot} />
              <Text style={styles.liveRateText}>
                Live: ₹{goldPrice.toLocaleString('en-IN')}/10g
              </Text>
            </View>
          )}
          
          {isMaintenanceMode && (
            <View style={styles.liveRateContainer}>
              <Text style={styles.maintenanceRateText}>
                Under Maintenance
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#FFD700"
            colors={['#FFD700']}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <FloatingHeader />
        
        {isMaintenanceMode ? (
          <View style={styles.maintenanceContainer}>
            <MaterialCommunityIcons name="wrench" size={80} color="#FFD700" />
            <Text style={styles.maintenanceTitle}>Under Maintenance</Text>
            <Text style={styles.maintenanceText}>
              Coin pricing is temporarily unavailable.
            </Text>
            <Text style={styles.maintenanceSubtext}>
              Please check back later.
            </Text>
          </View>
        ) : (
          <Animated.View
            style={[
              styles.coinContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {[1, 2, 5, 10, 20, 50, 100].map((weight, index) => (
              <CoinCard
                key={weight}
                weight={weight}
                price={(weight * goldPrice * 0.1005 + (weight >= 100 ? 2000: weight >= 50 ? 1700 : 
                  weight >= 20 ? 1400 : 
                  weight >= 10 ? 1100 :
                  weight >= 5 ? 800 : 500)) * 1.03}
                index={index}
              />
            ))}
          </Animated.View>
        )}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  headerGradient: {
    padding: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  liveRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00ff00',
    marginRight: 8,
  },
  liveRateText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  maintenanceRateText: {
    color: '#ff9800',
    fontSize: 14,
    fontWeight: '600',
  },
  coinContainer: {
    paddingHorizontal: 20,
  },
  coinCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  coinCardTouchable: {
    borderRadius: 20,
  },
  coinCardGradient: {
    borderRadius: 20,
  },
  coinCardBlur: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  coinLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    padding: 20,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 16,
  },
  coinIcon: {
    zIndex: 2,
  },
  iconGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 20,
    zIndex: 1,
  },
  coinWeight: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  coinWeightSubtitle: {
    fontSize: 12,
    color: '#a0a0a0',
    fontWeight: '500',
  },
  coinRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 20,
    top: 20,
    bottom: 20,
  },
  priceContainer: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  coinPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 2,
  },
  coinPriceSubtitle: {
    fontSize: 10,
    color: '#a0a0a0',
    fontWeight: '500',
  },
  chevronContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  bottomSpacing: {
    height: 40,
  },  maintenanceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 100,
  },
  maintenanceTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFD700',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  maintenanceText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  maintenanceSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },});