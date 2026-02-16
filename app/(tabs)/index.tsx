// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { BlurView } from 'expo-blur';
// import React, { useContext, useEffect, useRef, useState } from 'react';
// import {
//   Animated,
//   Dimensions,
//   FlatList,
//   Platform,
//   RefreshControl,
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   View
// } from 'react-native';
// import Colors from '../../constants/Colors';
// import { GoldPriceContext } from './_layout';

// const { width } = Dimensions.get('window');

// export default function Dashboard() {
//   // Hero section data (fetched from remote API)
//   const [heroImages, setHeroImages] = useState<{ _id: string; poster_no: number; url: string }[]>([]);
//   const [heroLoading, setHeroLoading] = useState<boolean>(false);
//   const [heroError, setHeroError] = useState<string | null>(null);
//   const [qualities, setQualities] = useState<{ karatage: string; ratio: number }[]>([]);
//   const [qualitiesLoading, setQualitiesLoading] = useState<boolean>(false);
//   const [qualitiesError, setQualitiesError] = useState<string | null>(null);
//   const { goldPrice: goldPriceFromContext, loading: contextLoading } = useContext(GoldPriceContext);
//   const [goldPrice, setGoldPrice] = useState<number>(goldPriceFromContext);
//   const [displayGold, setDisplayGold] = useState<boolean>(false);
//   const [refreshing, setRefreshing] = useState<boolean>(false);
//   const [priceChange, setPriceChange] = useState({ value: 0, isPositive: true });
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const prevPrice = useRef(goldPrice);

//   const [currentTime, setCurrentTime] = useState(new Date());
//   // const [batteryLevel, setBatteryLevel] = useState(100);
//   const [prevAsks, setPrevAsks] = useState<{[key: string]: number}>({});
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
//   // Notifications disabled for Expo Go compatibility
//   // async function setupNotifications() {
//   //   try {
//   //     const notificationService = new PushNotificationService();
//   //     await notificationService.initialize();
//   //     const token = await notificationService.getPushToken();
//   //     
//   //     console.log(token)
//   //   } catch (error) {
//   //     console.error("Error setting up notifications:", error);
//   //   }
//   // }

//   const animatePrice = (isIncrease: boolean) => {
//     fadeAnim.setValue(1);
//     Animated.sequence([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 0,
//         useNativeDriver: false,
//       }),
//       Animated.timing(fadeAnim, {
//         toValue: 0,
//         duration: 2000,
//         useNativeDriver: false,
//       })
//     ]).start();
//   };

//   useEffect(() => {
//     if (goldPriceFromContext !== prevPrice.current) {
//       animatePrice(goldPriceFromContext > prevPrice.current);
//       setPriceChange({
//         value: goldPriceFromContext - prevPrice.current,
//         isPositive: goldPriceFromContext > prevPrice.current
//       });
//       prevPrice.current = goldPriceFromContext;
//       setGoldPrice(goldPriceFromContext);
//     }
//   }, [goldPriceFromContext]);
  

//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);
  

//   useEffect(() => {
//     const newAsks: {[key: string]: number} = {};
//     [0.995, 0.995, 0.999, 0.995 * 1.03, 0.999 * 1.03].forEach((ratio, index) => {
//       const currentAsk = goldPrice * ratio;
//       newAsks[index] = currentAsk;
//     });
    
//     setPrevAsks(prev => {
//       const result = {...newAsks};
//       Object.keys(newAsks).forEach(key => {
//         if (!prev[key]) prev[key] = newAsks[key];
//       });
//       return prev;
//     });
//   }, [goldPrice]);

//   const onRefresh = React.useCallback(() => {
//     setRefreshing(true);
//     setTimeout(() => setRefreshing(false), 1500);
//   }, []);
  
//   // Fetch hero images
//   useEffect(() => {
//     const fetchHeroImages = async () => {
//       try {
//         setHeroLoading(true);
//         setHeroError(null);
//         const response = await fetch('https://admin-pearl-kappa-34.vercel.app/api/heroposter');
//         if (!response.ok) {
//           throw new Error(`Failed to load hero posters: ${response.status}`);
//         }
//         const data: { _id: string; poster_no: number; url: string }[] = await response.json();
//         setHeroImages(data);
//       } catch (error: any) {
//         setHeroError(error?.message ?? 'Failed to load hero posters');
//       } finally {
//         setHeroLoading(false);
//       }
//     };
//     fetchHeroImages();
//   }, []);

//   // Fetch qualities (karatage ratios)
//   useEffect(() => {
//     const fetchQualities = async () => {
//       try {
//         setQualitiesLoading(true);
//         setQualitiesError(null);
//         const response = await fetch('https://admin-pearl-kappa-34.vercel.app/api/quality');
//         if (!response.ok) {
//           throw new Error(`Failed to load qualities: ${response.status}`);
//         }
//         const apiData: { _id: string; quality: string; price: number }[] = await response.json();
//         // Map API fields to UI fields
//         const mapped = apiData.map(item => ({
//           karatage: item.quality?.toUpperCase() ?? '',
//           ratio: item.price ?? 0,
//         }));
//         setQualities(mapped);
//       } catch (error: any) {
//         setQualitiesError(error?.message ?? 'Failed to load qualities');
//       } finally {
//         setQualitiesLoading(false);
//       }
//     };
//     fetchQualities();
//   }, []);


//   const PriceCard = ({ karatage, ratio }: { karatage: string; ratio: number }) => (
//     <BlurView intensity={15} tint="dark" style={styles.karatCard}>
//       <Text style={styles.karatTitle}>{karatage}</Text>
//       <Text style={styles.karatPrice}>₹{(goldPrice * ratio).toLocaleString('en-IN', {
//         maximumFractionDigits: 2,
//         minimumFractionDigits: 2
//       })}</Text>
//     </BlurView>
//   );

//   const HeroSection = () => (
//     <View style={styles.heroContainer}>
//       <FlatList
//         data={heroImages}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         pagingEnabled
//         onMomentumScrollEnd={(event) => {
//           const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
//           setCurrentImageIndex(newIndex);
//         }}
//         renderItem={({ item }) => (
//           <View style={styles.heroSlide}>
//             <View style={styles.heroImageContainer}>
//               <Animated.Image
//                 source={{ uri: item.url }}
//                 style={styles.heroImage}
//                 resizeMode="cover"
//               />
//               <View style={styles.heroOverlay}>
//                 <Text style={styles.heroTitle}>{`Banner ${item.poster_no}`}</Text>
//                 <Text style={styles.heroSubtitle}>Discover our finest collection</Text>
//               </View>
//             </View>
//           </View>
//         )}
//         keyExtractor={(item) => item._id ?? String(item.poster_no)}
//       />
//       <View style={styles.paginationContainer}>
//         {heroImages.map((_, index) => (
//           <View
//             key={index}
//             style={[
//               styles.paginationDot,
//               index === currentImageIndex && styles.paginationDotActive
//             ]}
//           />
//         ))}
//       </View>
//     </View>
//   );


//   const StatusHeader = () => (
//     <View style={styles.statusHeader}>
//       <Text style={styles.statusText}>
//         {/* {currentTime.toLocaleTimeString()} | 4G | {batteryLevel}% */}
//       </Text>
//     </View>
//   );
//   useEffect(() => {
//     // setupNotifications(); // Disabled for Expo Go
    
//   }, []);
//   return (
//     <SafeAreaView style={styles.container}>


//       <ScrollView
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//         showsVerticalScrollIndicator={false}
//         style={styles.content}
//       >
        
//         <HeroSection />

//         <Animated.View style={[
//           styles.mainPriceCard,
//           {
//             backgroundColor: fadeAnim.interpolate({
//               inputRange: [0, 1],
//               outputRange: [Colors.surfaceDark, priceChange.isPositive ? Colors.backgroundLight : Colors.backgroundMedium]
//             })
//           }
//         ]}>
//           <Text style={styles.currentPrice}>{goldPrice === 0 ? "...." : `₹${goldPrice.toLocaleString('en-IN', {
//             maximumFractionDigits: 2,
//             minimumFractionDigits: 2
//           })}`}</Text>
//           <View style={[styles.priceChangeContainer, {
//             backgroundColor: priceChange.isPositive ? Colors.backgroundLight : Colors.backgroundMedium
//           }]}>
//             <MaterialCommunityIcons
//               name={priceChange.isPositive ? 'trending-up' : 'trending-down'}
//               size={20}
//               color={Colors.fontColors}
//             />
//             <Text style={[styles.priceChangeText, {
//               color: Colors.fontColors
//             }]}>
//               ₹{Math.abs(priceChange.value).toLocaleString('en-IN', {
//                 maximumFractionDigits: 2,
//                 minimumFractionDigits: 2
//               })}
//             </Text>
//           </View>
//         </Animated.View>

        
//           <View style={styles.karatContainer}>
//             {qualitiesLoading && (
//               <Text style={{ color: '#000', marginBottom: 8 }}>Loading qualities...</Text>
//             )}
//             {qualitiesError && (
//               <Text style={{ color: 'red', marginBottom: 8 }}>{qualitiesError}</Text>
//             )}
//             {(!qualitiesLoading && !qualitiesError && qualities.length > 0) && (
//               qualities.map((item) => (
//                 <PriceCard key={item.karatage} {...item} />
//               ))
//             )}
//           </View>
          
//       </ScrollView>

      
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.background,
//     paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
//   },
//   statusHeader: {
//     backgroundColor: Colors.surfaceDark,
//     padding: 5,
//     alignItems: 'flex-end',
//   },
//   statusText: {
//     color: Colors.textPrimary,
//     fontSize: 12,
//   },
//   content: {
//     flex: 1,
//   },
  
//   mainPriceCard: {
//     margin: 20,

//     padding: 20,
//     borderRadius: 20,
//     backgroundColor: Colors.surface,
//     shadowColor: Colors.background,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   currentPrice: {
//     fontSize: 36,
//     fontWeight: '700',
//     color: Colors.textPrimary,
//     textAlign: 'center',
//   },
//   priceChangeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: Colors.backgroundLight,
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
//   karatContainer: {
//     padding: 20,
//     // paddingVertical:10,
//   },
//   karatCard: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: Colors.surfaceDark,
//     padding: 15,
//     borderRadius: 16,
//     marginBottom: 12,
//     overflow: 'hidden',
//     borderWidth: 1,
//     borderColor: Colors.fontColorsLight,
//   },
//   karatTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: Colors.textPrimary,
//   },
//   karatPrice: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: Colors.fontColors,
//   },
  
//   // Hero Section Styles
//   heroContainer: {
//     height: 250,
//     marginBottom: 20,
//   },
//   heroSlide: {
//     width: width,
//     height: 250,
//   },
//   heroImageContainer: {
//     width: '100%',
//     height: '100%',
//     position: 'relative',
//   },
//   heroImage: {
//     width: '100%',
//     height: '100%',
//   },
//   heroOverlay: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: Colors.backgroundMedium,
//     padding: 20,
//   },
//   heroTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: Colors.textPrimary,
//     marginBottom: 8,
//   },
//   heroSubtitle: {
//     fontSize: 16,
//     color: Colors.textSecondary,
//     opacity: 0.9,
//   },
//   paginationContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'absolute',
//     bottom: 10,
//     left: 0,
//     right: 0,
//   },
//   paginationDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: Colors.fontColorsLight,
//     marginHorizontal: 4,
//   },
//   paginationDotActive: {
//     backgroundColor: Colors.fontColors,
//   },
// });


import { PushNotificationService } from '@/utils/notifications';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { GoldPriceContext } from './_layout';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const [heroImages, setHeroImages] = useState<{ _id: string; poster_no: number; url: string }[]>([]);
  const [heroLoading, setHeroLoading] = useState<boolean>(false);
  const [heroError, setHeroError] = useState<string | null>(null);
  const [qualities, setQualities] = useState<{ karatage: string; ratio: number }[]>([]);
  const [qualitiesLoading, setQualitiesLoading] = useState<boolean>(false);
  const [qualitiesError, setQualitiesError] = useState<string | null>(null);
  const { goldPrice: goldPriceFromContext, loading: contextLoading, isMaintenanceMode } = useContext(GoldPriceContext);
  const [goldPrice, setGoldPrice] = useState<number>(goldPriceFromContext);
  const [displayGold, setDisplayGold] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [priceChange, setPriceChange] = useState({ value: 0, isPositive: true });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const cardAnims = useRef([...Array(5)].map(() => new Animated.Value(0))).current;
  const prevPrice = useRef(goldPrice);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [prevAsks, setPrevAsks] = useState<{[key: string]: number}>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const currentImageIndexRef = useRef(0);
  const flatListRef = useRef<FlatList>(null);
  const disclaimerAnim = useRef(new Animated.Value(0)).current;
  const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
  }, []);

  const startAutoScroll = useCallback(() => {
    stopAutoScroll();

    if (heroImages.length <= 1) return;

    autoScrollInterval.current = setInterval(() => {
      const nextIndex = (currentImageIndexRef.current + 1) % heroImages.length;
      currentImageIndexRef.current = nextIndex;
      setCurrentImageIndex(nextIndex);

      flatListRef.current?.scrollToOffset({
        offset: width * nextIndex,
        animated: true,
      });
    }, 5000); // Change banner every 5 seconds
  }, [heroImages.length, stopAutoScroll]);

  // Notification setup to capture and register device tokens
  const setupNotifications = useCallback(async () => {
    try {
      const notificationService = new PushNotificationService();
      await notificationService.initialize();
      const token = await notificationService.getPushToken();

      if (token) {
        console.log('Expo push token registered:', token);
      } else {
        console.log('Push token unavailable.');
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setupNotifications();
    }
  }, [setupNotifications]);

  const animatePrice = (isIncrease: boolean) => {
    fadeAnim.setValue(1);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 0,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        })
      ]),
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.05,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        })
      ])
    ]).start();
  };

  useEffect(() => {
    if (goldPriceFromContext !== prevPrice.current) {
      animatePrice(goldPriceFromContext > prevPrice.current);
      setPriceChange({
        value: goldPriceFromContext - prevPrice.current,
        isPositive: goldPriceFromContext > prevPrice.current
      });
      prevPrice.current = goldPriceFromContext;
      setGoldPrice(goldPriceFromContext);
    }
  }, [goldPriceFromContext]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll hero banners
  useEffect(() => {
    startAutoScroll();
    return () => {
      stopAutoScroll();
    };
  }, [startAutoScroll, stopAutoScroll]);

  useEffect(() => {
    const newAsks: {[key: string]: number} = {};
    [0.995, 0.995, 0.999, 0.995 * 1.03, 0.999 * 1.03].forEach((ratio, index) => {
      const currentAsk = goldPrice * ratio;
      newAsks[index] = currentAsk;
    });
    
    setPrevAsks(prev => {
      const result = {...newAsks};
      Object.keys(newAsks).forEach(key => {
        if (!prev[key]) prev[key] = newAsks[key];
      });
      return prev;
    });
  }, [goldPrice]);

  useEffect(() => {
    Animated.stagger(100, 
      cardAnims.map(anim => 
        Animated.spring(anim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [qualities]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);
  
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        setHeroLoading(true);
        setHeroError(null);
        const response = await fetch('https://admin-pearl-kappa-34.vercel.app/api/heroposter');
        if (!response.ok) {
          throw new Error(`Failed to load hero posters: ${response.status}`);
        }
        const data: { _id: string; poster_no: number; url: string }[] = await response.json();
        setHeroImages(data);
      } catch (error: any) {
        setHeroError(error?.message ?? 'Failed to load hero posters');
      } finally {
        setHeroLoading(false);
      }
    };
    fetchHeroImages();
  }, []);

  useEffect(() => {
    const fetchQualities = async () => {
      try {
        setQualitiesLoading(true);
        setQualitiesError(null);
        const response = await fetch('https://admin-pearl-kappa-34.vercel.app/api/quality');
        if (!response.ok) {
          throw new Error(`Failed to load qualities: ${response.status}`);
        }
        const apiData: { _id: string; quality: string; price: number }[] = await response.json();
        const mapped = apiData.map(item => ({
          karatage: item.quality?.toUpperCase() ?? '',
          ratio: item.price ?? 0,
        }));
        setQualities(mapped);
      } catch (error: any) {
        setQualitiesError(error?.message ?? 'Failed to load qualities');
      } finally {
        setQualitiesLoading(false);
      }
    };
    fetchQualities();
  }, []);

  // Auto-slide banner every 5 seconds
  useEffect(() => {
    if (heroImages.length <= 1) return;

    const autoSlideInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % heroImages.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(autoSlideInterval);
  }, [heroImages.length]);

  // Animate disclaimer text (slide from left to right every 30 seconds)
  useEffect(() => {
    const startAnimation = () => {
      disclaimerAnim.setValue(0);
      Animated.timing(disclaimerAnim, {
        toValue: 1,
        duration: 30000,
        useNativeDriver: true,
      }).start(() => {
        // Restart animation after completion
        setTimeout(startAnimation, 0);
      });
    };

    startAnimation();
  }, [disclaimerAnim]);

  const PriceCard = ({ karatage, ratio, index }: { karatage: string; ratio: number; index: number }) => {
    const animValue = cardAnims[index] || new Animated.Value(0);
    
    return (
      <Animated.View
        style={[
          styles.karatCardWrapper,
          {
            opacity: animValue,
            transform: [
              {
                translateY: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
              {
                scale: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(255, 215, 0, 0.15)', 'rgba(255, 215, 0, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.karatGradient}
        >
          <BlurView intensity={20} tint="dark" style={styles.karatCard}>
            <View style={styles.karatLeft}>
              <View style={styles.iconBadge}>
                <MaterialCommunityIcons name="gold" size={20} color="#FFD700" />
              </View>
              <View>
                <Text style={styles.karatTitle}>{karatage}</Text>
                <Text style={styles.karatSubtitle}>Per 10g</Text>
              </View>
            </View>
            <View style={styles.karatRight}>
              <Text style={styles.karatPrice}>
                ₹{(goldPrice * ratio).toLocaleString('en-IN', {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2
                })}
              </Text>
              <View style={styles.sparkle}>
                {/* <MaterialCommunityIcons name="sparkles" size={12} color="#FFD700" /> */}
              </View>
            </View>
          </BlurView>
        </LinearGradient>
      </Animated.View>
    );
  };

  const HeroSection = () => (
    <View style={styles.heroContainer}>
      <FlatList
        ref={flatListRef}
        data={heroImages}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={width}
        decelerationRate="fast"
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onScrollBeginDrag={stopAutoScroll}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          currentImageIndexRef.current = newIndex;
          setCurrentImageIndex(newIndex);
          startAutoScroll();
        }}
        onScrollToIndexFailed={(info) => {
          // Handle scroll failure gracefully
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToOffset({ offset: width * info.index, animated: true });
          });
        }}
        renderItem={({ item }) => (
          <View style={styles.heroSlide}>
            <View style={styles.heroImageContainer}>
              <Animated.Image
                source={{ uri: item.url }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </View>
          </View>
        )}
        keyExtractor={(item) => item._id ?? String(item.poster_no)}
      />
      {heroImages.length > 1 && (
        <View style={styles.paginationContainer}>
          {heroImages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentImageIndex && styles.paginationDotActive
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a', '#0a0a0a']}
        style={styles.backgroundGradient}
      >
        <ScrollView
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#FFD700"
            />
          }
          showsVerticalScrollIndicator={false}
          style={styles.content}
        >
          <HeroSection />

          <View style={styles.priceSection}>
            <Text style={styles.sectionTitle}>Live Gold Price</Text>
            <Animated.View 
              style={[
                styles.mainPriceCardWrapper,
                { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <LinearGradient
                colors={[
                  fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['rgba(255, 215, 0, 0.2)', priceChange.isPositive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)']
                  }) as any,
                  'rgba(255, 215, 0, 0.1)'
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.mainPriceGradient}
              >
                <BlurView intensity={30} tint="dark" style={styles.mainPriceCard}>
                  <View style={styles.priceHeader}>
                    <MaterialCommunityIcons name="gold" size={32} color="#FFD700" />
                    <Text style={styles.priceLabel}>24K Gold / 10g</Text>
                  </View>
                  
                  {isMaintenanceMode ? (
                    <View style={styles.maintenanceContainer}>
                      <MaterialCommunityIcons name="tools" size={48} color="#FFD700" />
                      <Text style={styles.maintenanceText}>Under Maintenance</Text>
                      <Text style={styles.maintenanceSubtext}>Pricing updates temporarily unavailable</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.currentPrice}>
                        {goldPrice === 0 ? "..." : `₹${goldPrice.toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                          minimumFractionDigits: 2
                        })}`} 
                      </Text>
                      <Text> + 3% GST</Text>
                      <View style={styles.updateTime}>
                        <MaterialCommunityIcons name="update" size={12} color="#888" />
                        <Text style={styles.updateText}>
                          Updated at {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    </>
                  )}
                </BlurView>
              </LinearGradient>
            </Animated.View>
          </View>

          <View style={styles.qualitiesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Gold Qualities</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
            </View>
            
            {qualitiesLoading && (
              <Text style={styles.loadingText}>Loading qualities...</Text>
            )}
            {qualitiesError && (
              <Text style={styles.errorText}>{qualitiesError}</Text>
            )}
            {isMaintenanceMode ? (
              <View style={styles.maintenanceContainer}>
                <MaterialCommunityIcons name="tools" size={48} color="#FFD700" />
                <Text style={styles.maintenanceText}>Under Maintenance</Text>
                <Text style={styles.maintenanceSubtext}>Pricing updates temporarily unavailable</Text>
              </View>
            ) : (
              (!qualitiesLoading && !qualitiesError && qualities.length > 0) && (
                <View style={styles.karatContainer}>
                  {qualities.map((item, index) => (
                    <PriceCard key={item.karatage} {...item} index={index} />
                  ))}
                </View>
              )
            )}
          </View>
        </ScrollView>

        {/* Scrolling Disclaimer at Bottom */}
        <View style={styles.disclaimerContainer}>
          <Animated.View
            style={[
              styles.disclaimerTextWrapper,
              {
                transform: [
                  {
                    translateX: disclaimerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [width, -width],
                    }),
                  },
                ],
              },
            ]}
          >
            <MaterialCommunityIcons name="information" size={16} color="#FFD700" />
            <Text style={styles.disclaimerText}>
              Prices may vary. Please verify before ordering.
            </Text>
          </Animated.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  backgroundGradient: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  
  // Hero Section
  heroContainer: {
    height: 300,
    marginBottom: 24,
  },
  heroSlide: {
    width: width,
    height: 300,
  },
  heroImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  heroContent: {
    padding: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 12,
  },
  heroAccent: {
    width: 60,
    height: 4,
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#FFD700',
    width: 24,
  },

  // Price Section
  priceSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  mainPriceCardWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  mainPriceGradient: {
    borderRadius: 24,
    padding: 2,
  },
  mainPriceCard: {
    padding: 24,
    borderRadius: 22,
    overflow: 'hidden',
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 16,
    color: '#aaa',
    marginLeft: 12,
    fontWeight: '600',
  },
  currentPrice: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
    letterSpacing: -1,
  },
  priceChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  priceChangeText: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 6,
  },
  changeLabel: {
    fontSize: 14,
    color: '#888',
    marginLeft: 8,
  },
  updateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  updateText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 6,
  },

  // Qualities Section
  qualitiesSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  karatContainer: {
    gap: 12,
  },
  karatCardWrapper: {
    borderRadius: 20,
  },
  karatGradient: {
    borderRadius: 20,
    padding: 2,
  },
  karatCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  karatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  karatTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  karatSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  karatRight: {
    alignItems: 'flex-end',
  },
  karatPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 4,
  },
  sparkle: {
    opacity: 0.6,
  },
  loadingText: {
    color: '#888',
    textAlign: 'center',
    marginVertical: 20,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginVertical: 20,
  },
  maintenanceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  maintenanceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  maintenanceSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  disclaimerContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 215, 0, 0.3)',
    paddingVertical: 12,
    overflow: 'hidden',
  },
  disclaimerTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  disclaimerText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
});