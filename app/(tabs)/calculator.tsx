import Colors from '@/constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Keyboard,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { GoldPriceContext } from './_layout';

const { width } = Dimensions.get('window');

export default function Calculator() {
  const { goldPrice: goldPriceFromContext, isMaintenanceMode } = useContext(GoldPriceContext);
  const [quality, setQuality] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [otherCharges, setOtherCharges] = useState<string>('');
  const [making, setMaking] = useState<string>('');
  const [customMaking, setCustomMaking] = useState<string>('');
  const [isCustomMaking, setIsCustomMaking] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [price, setPrice] = useState<number | null>(null);
  const [calculatedmaking, setcalculatedMaking] = useState<number | null>(null);
  const [calculatedweight, setcalculatedWeigt] = useState<number | null>(null);
  const [calculatedOtherCharges, setCalculatedOtherCharges] = useState<number | null>(null);
  const [gst, setGst] = useState<number | null>(null);
  const [goldQualities, setGoldQualities] = useState<{ karat: string; ratio: number; description: string }[]>([]);
  const [qualitiesLoading, setQualitiesLoading] = useState<boolean>(false);
  const [qualitiesError, setQualitiesError] = useState<string | null>(null);

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
          karat: (item.quality || '').toUpperCase(),
          ratio: item.price ?? 0,
          description: 'Gold Quality',
        }));
        setGoldQualities(mapped);
      } catch (error: any) {
        setQualitiesError(error?.message ?? 'Failed to load qualities');
      } finally {
        setQualitiesLoading(false);
      }
    };
    fetchQualities();
  }, []);

  const makingCharges = [
    { charge: '10%', ratio: 0.10, description: 'Simple Design' },
    { charge: '12%', ratio: 0.12, description: 'Complex Design' },
    { charge: '14%', ratio: 0.14, description: 'Premium Design' },
    { charge: 'Custom', ratio: 0, description: 'Enter Custom Rate' },
  ];

  const calculatePrice = () => {
    if (!quality || !weight || parseFloat(weight) <= 0) {
      Alert.alert('Missing Information', 'Please select quality and enter weight');
      return;
    }

    if (goldQualities.length === 0) {
      Alert.alert('Qualities Loading', 'Please wait for qualities to load.');
      return;
    }

    if (!making && !isCustomMaking) {
      Alert.alert('Missing Information', 'Please select making charges');
      return;
    }

    if (isCustomMaking && (!customMaking || parseFloat(customMaking) < 0)) {
      Alert.alert('Invalid Input', 'Please enter a valid custom making charge');
      return;
    }

    const parsedOtherCharges = otherCharges.trim() ? parseFloat(otherCharges) : 0;

    if (isNaN(parsedOtherCharges) || parsedOtherCharges < 0) {
      Alert.alert('Invalid Input', 'Please enter a valid amount for other charges');
      return;
    }

    const selectedQuality = goldQualities.find(q => q.karat === quality);
    let makingRatio = 0;

    if (isCustomMaking) {
      makingRatio = parseFloat(customMaking) / 100;
    } else {
      const selectedMaking = makingCharges.find(m => m.charge === making);
      makingRatio = selectedMaking?.ratio || 0;
    }

    if (selectedQuality) {
      const basePrice = parseFloat(weight) * goldPriceFromContext * 0.1* selectedQuality.ratio;
      const makingChargesValue = parseFloat(weight) * goldPriceFromContext *0.1* makingRatio;
      const subtotalBeforeGst = basePrice + makingChargesValue + parsedOtherCharges;
      const gst_charge = (subtotalBeforeGst * 0.03);
      const totalPrice = (subtotalBeforeGst * 1.03) + 45; // 3% GST

      setPrice(totalPrice);
      setcalculatedMaking(makingChargesValue);
      setcalculatedWeigt(basePrice);
      setCalculatedOtherCharges(parsedOtherCharges);
      setGst(gst_charge);
    }
    
    Keyboard.dismiss();
  };

  const generatePDFContent = () => {
    const currentDate = new Date().toLocaleDateString('en-IN');
    const currentTime = new Date().toLocaleTimeString('en-IN');
    const showOtherCharges = (calculatedOtherCharges ?? 0) > 0;
    const formattedOtherCharges = calculatedOtherCharges?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) ?? '0';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Gold Price Calculation Bill</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          padding: 30px;
          text-align: center;
          color: #1a1a1a;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .subtitle {
          font-size: 16px;
          opacity: 0.8;
        }
        .bill-info {
          padding: 20px;
          background: #f8f9fa;
          border-bottom: 2px solid #e9ecef;
        }
        .bill-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .content {
          padding: 30px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #FFD700;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .detail-label {
          font-weight: 600;
          color: #555;
        }
        .detail-value {
          font-weight: bold;
          color: #2c3e50;
        }
        .total-section {
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
          padding: 20px;
          margin: 20px -30px -30px -30px;
          text-align: center;
        }
        .total-amount {
          font-size: 32px;
          font-weight: bold;
          margin: 10px 0;
        }
        .footer {
          text-align: center;
          padding: 20px;
          background: #f8f9fa;
          font-size: 12px;
          color: #666;
        }
        .highlight {
          background: #fff3cd;
          padding: 2px 6px;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">💎 Fancy Jewellers Gold Calculator</div>
          <div class="subtitle">Fancy Jewellers Gold Price Calculation</div>
        </div>
        
        <div class="bill-info">
          <div class="bill-row">
            <span><strong>Date:</strong> ${currentDate}</span>
            <span><strong>Time:</strong> ${currentTime}</span>
          </div>
          ${customerName ? `<div class="bill-row"><span><strong>Customer:</strong> ${customerName}</span></div>` : ''}
          <div class="bill-row">
            <span><strong>Gold Rate:</strong> ₹${goldPriceFromContext.toLocaleString('en-IN')} per 10g</span>
          </div>
        </div>

        <div class="content">
          <div class="section">
            <div class="section-title">📋 Calculation Details</div>
            <div class="detail-row">
              <span class="detail-label">Gold Quality:</span>
              <span class="detail-value highlight">${quality}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Weight:</span>
              <span class="detail-value">${weight} grams</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Making Charges:</span>
              <span class="detail-value">${isCustomMaking ? customMaking + '%' : making}</span>
            </div>
            ${showOtherCharges ? `
            <div class="detail-row">
              <span class="detail-label">Other Charges:</span>
              <span class="detail-value">₹${formattedOtherCharges}</span>
            </div>` : ''}
          </div>

          <div class="section">
            <div class="section-title">💰 Price Breakdown</div>
            <div class="detail-row">
              <span class="detail-label">Gold Weight Amount:</span>
              <span class="detail-value">₹${calculatedweight?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Making Charges:</span>
              <span class="detail-value">₹${calculatedmaking?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
            ${showOtherCharges ? `
            <div class="detail-row">
              <span class="detail-label">Other Charges:</span>
              <span class="detail-value">₹${formattedOtherCharges}</span>
            </div>` : ''}
            <div class="detail-row">
              <span class="detail-label">Hallmarking:</span>
              <span class="detail-value">₹45</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">GST (3%):</span>
              <span class="detail-value">₹${gst?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>

        <div class="total-section">
          <div style="font-size: 18px; margin-bottom: 10px;"> Final Amount</div>
          <div class="total-amount">₹${price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
          <div style="font-size: 14px; opacity: 0.9;">All taxes included</div>
        </div>

        <div class="footer">
          Generated by Fancy Jewellers App • ${currentDate} ${currentTime}<br>
          This is a price estimation. Actual prices may vary.
        </div>
      </div>
    </body>
    </html>
    `;
  };

  const saveToPDF = async () => {
    if (price === null) {
      Alert.alert('No Calculation', 'Please calculate the price first');
      return;
    }

    try {
      const htmlContent = generatePDFContent();
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      Alert.alert(
        'Success!',
        'Bill generated successfully.',
        [
          { text: 'OK' },
          { 
            text: 'Share', 
            onPress: () => sharePDF(uri)
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save PDF. Please try again.');
      console.error('PDF Save Error:', error);
    }
  };

  const sharePDF = async (uri?: string) => {
    if (price === null) {
      Alert.alert('No Calculation', 'Please calculate the price first');
      return;
    }

    try {
      let pdfUri = uri;
      
      if (!pdfUri) {
        const htmlContent = generatePDFContent();
        const { uri: tempUri } = await Print.printToFileAsync({
          html: htmlContent,
          base64: false,
        });
        pdfUri = tempUri;
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Gold Calculation Bill',
        });
      } else {
        // Fallback to Share API
        const shareContent = `Gold Calculation Bill
Customer: ${customerName || 'N/A'}
Quality: ${quality}
Weight: ${weight}g
Making: ${isCustomMaking ? customMaking + '%' : making}
Other Charges: ₹${calculatedOtherCharges?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) ?? '0'}
Total: ₹${price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
        
        await Share.share({
          message: shareContent,
          title: 'Gold Calculation Bill'
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share. Please try again.');
      console.error('Share Error:', error);
    }
  };

  const resetCalculator = () => {
    setQuality('');
    setWeight('');
    setOtherCharges('');
    setMaking('');
    setCustomMaking('');
    setIsCustomMaking(false);
    setCustomerName('');
    setPrice(null);
    setcalculatedMaking(null);
    setcalculatedWeigt(null);
    setCalculatedOtherCharges(null);
    setGst(null);
  };

  const QualityCard = ({ karat, description, selected, onSelect }: {
    karat: string;
    description: string;
    selected: boolean;
    onSelect: () => void;
  }) => (
    <TouchableOpacity
      onPress={onSelect}
      style={[styles.qualityCard, selected && styles.selectedCard]}
      activeOpacity={0.7}
    >
      <View style={styles.qualityContent}>
        <Text style={[styles.qualityKarat, selected && styles.selectedText]}>{karat}</Text>
        <Text style={[styles.qualityDescription, selected && styles.selectedText]}>{description}</Text>
      </View>
      {selected && (
        <MaterialCommunityIcons 
          name="check-circle" 
          size={20} 
          color="#000" 
          style={styles.checkIcon}
        />
      )}
    </TouchableOpacity>
  );

  const MakingCard = ({ charge, description, selected, onSelect }: {
    charge: string;
    description: string;
    selected: boolean;
    onSelect: () => void;
  }) => (
    <TouchableOpacity
      onPress={onSelect}
      style={[styles.makingCard, selected && styles.selectedCard]}
      activeOpacity={0.7}
    >
      <View style={styles.makingContent}>
        <Text style={[styles.makingCharge, selected && styles.selectedText]}>{charge}</Text>
        <Text style={[styles.makingDescription, selected && styles.selectedText]}>{description}</Text>
      </View>
      {selected && (
        <MaterialCommunityIcons 
          name="check-circle" 
          size={18} 
          color="#000" 
          style={styles.checkIcon}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      <View style={styles.header}>
        <Text style={styles.currentPrice}>
          {isMaintenanceMode ? (
            "Under Maintenance"
          ) : (
            `Current Rate: ₹${goldPriceFromContext.toLocaleString('en-IN', {
              maximumFractionDigits: 2
            })} / 10g`
          )}
        </Text>
      </View>

      {isMaintenanceMode ? (
        <View style={styles.maintenanceWrapper}>
          <View style={styles.maintenanceContainer}>
            <MaterialCommunityIcons name="tools" size={80} color={Colors.fontColors} />
            <Text style={styles.maintenanceTitle}>Under Maintenance</Text>
            <Text style={styles.maintenanceText}>
              The calculator is temporarily unavailable.{'\n'}
              Please check back later.
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
        <View style={styles.calculatorCard}>
          {/* Customer Name Input */}
          <Text style={styles.sectionTitle}>👤 Customer Information (Optional)</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="account" size={20} color={Colors.fontColors} />
            <TextInput
              style={styles.input}
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Enter customer name"
              placeholderTextColor="#666"
              selectionColor="#FFD700"
            />
          </View>

          {/* Quality Selection */}
          <Text style={styles.sectionTitle}>✨ Select Quality</Text>
          {qualitiesLoading && (
            <Text style={{ color: Colors.fontColors, marginBottom: 8 }}>Loading qualities...</Text>
          )}
          {qualitiesError && (
            <Text style={{ color: '#ff6b6b', marginBottom: 8 }}>Error: {qualitiesError}</Text>
          )}
          <View style={styles.qualityContainer}>
            {goldQualities.map((item) => (
              <QualityCard
                key={item.karat}
                karat={item.karat}
                description={item.description}
                selected={quality === item.karat}
                onSelect={() => setQuality(item.karat)}
              />
            ))}
          </View>

          {/* Making Charges */}
          <Text style={styles.sectionTitle}>🔨 Making Charges</Text>
          <View style={styles.makingContainer}>
            {makingCharges.map((item) => (
              <MakingCard
                key={item.charge}
                charge={item.charge}
                description={item.description}
                selected={item.charge === 'Custom' ? isCustomMaking : making === item.charge}
                onSelect={() => {
                  if (item.charge === 'Custom') {
                    setIsCustomMaking(true);
                    setMaking('');
                  } else {
                    setIsCustomMaking(false);
                    setMaking(item.charge);
                    setCustomMaking('');
                  }
                }}
              />
            ))}
          </View>

          {/* Custom Making Input */}
          {isCustomMaking && (
            <View style={styles.customMakingContainer}>
              <Text style={styles.customMakingLabel}>Enter Custom Making Charge (%)</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="percent" size={20} color="#FFD700" />
                <TextInput
                  style={styles.input}
                  value={customMaking}
                  onChangeText={setCustomMaking}
                  keyboardType="decimal-pad"
                  placeholder="e.g., 15"
                  placeholderTextColor="#666"
                  selectionColor="#FFD700"
                />
                <Text style={styles.unitText}>%</Text>
              </View>
            </View>
          )}

          {/* Weight Input */}
          <Text style={styles.sectionTitle}>⚖️ Weight</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="scale" size={20} color={Colors.fontColors} />
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="Enter weight in grams"
              placeholderTextColor="#666"
              selectionColor="#FFD700"
            />
            <Text style={styles.unitText}>grams</Text>
          </View>

          {/* Other Charges Input */}
          <Text style={styles.sectionTitle}>➕ Other Charges (Optional)</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="cash-plus" size={20} color={Colors.fontColors} />
            <TextInput
              style={styles.input}
              value={otherCharges}
              onChangeText={setOtherCharges}
              keyboardType="decimal-pad"
              placeholder="Enter additional charges"
              placeholderTextColor="#666"
              selectionColor="#FFD700"
            />
            <Text style={styles.unitText}>₹</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.calculateButton, 
                (!quality || !weight || (!making && !isCustomMaking)) && styles.disabledButton
              ]}
              onPress={calculatePrice}
              disabled={!quality || !weight || (!making && !isCustomMaking)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="calculator" size={24} color="#fff" />
              <Text style={styles.calculateButtonText}>Calculate Price</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetCalculator}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="refresh" size={20} color="#666" />
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Results */}
        {price !== null && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <MaterialCommunityIcons name="receipt" size={24} color="#FFD700" />
              <Text style={styles.resultTitle}>Calculation Result</Text>
            </View>

            <View style={styles.calcontainer}>
              <View style={styles.row}>
                <Text style={styles.label}>GOLD WEIGHT:</Text>
                <Text style={styles.value}>{weight} Grams</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>GOLD WEIGHT AMOUNT:</Text>
                <Text style={styles.value}>₹{calculatedweight?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>MAKING CHARGES:</Text>
                <Text style={styles.value}>
                  ₹{calculatedmaking?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>OTHER CHARGES:</Text>
                <Text style={styles.value}>
                  ₹{(calculatedOtherCharges ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>HALLMARKING:</Text>
                <Text style={styles.value}>₹45</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>GST (3%):</Text>
                <Text style={styles.value}>
                  ₹{gst?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </Text>
              </View>

              <View style={styles.finalAmountContainer}>
                <Text style={styles.finalAmountLabel}>💎 FINAL AMOUNT</Text>
                <Text style={styles.finalAmountValue}>
                  ₹{price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </Text>
              </View>
            </View>

            {/* PDF Action Buttons */}
            <View style={styles.pdfButtonContainer}>
              <TouchableOpacity
                style={styles.pdfButton}
                onPress={saveToPDF}
                activeOpacity={0.8}
              >
                <Ionicons name="download" size={20} color="#fff" />
                <Text style={styles.pdfButtonText}>Save as PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => sharePDF()}
                activeOpacity={0.8}
              >
                <Ionicons name="share" size={20} color="#fff" />
                <Text style={styles.pdfButtonText}>Share Bill</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.2)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.fontColors,
    marginLeft: 12,
  },
  currentPrice: {
    fontSize: 16,
    color: Colors.fontColors,
    textAlign: 'center',
    fontWeight: '500',
  },
  scrollContent: {
    padding: 20,
  },
  calculatorCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.fontColors,
    marginBottom: 16,
    marginTop: 8,
  },
  qualityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  qualityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: '31%',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  qualityContent: {
    alignItems: 'center',
  },
  selectedCard: {
    backgroundColor: Colors.fontColors,
    borderColor: '#E7B858',
  },
  qualityKarat: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  qualityDescription: {
    fontSize: 10,
    color: '#9e9e9e',
    textAlign: 'center',
  },
  selectedText: {
    color: '#000000',
  },
  checkIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  makingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  makingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  makingContent: {
    alignItems: 'center',
  },
  makingCharge: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  makingDescription: {
    fontSize: 10,
    color: '#9e9e9e',
    textAlign: 'center',
  },
  customMakingContainer: {
    marginBottom: 20,
  },
  customMakingLabel: {
    fontSize: 14,
    color: '#E7B858',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  input: {
    flex: 1,
    height: 50,
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  unitText: {
    fontSize: 14,
    color: '#9e9e9e',
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 12,
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E7B858',
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: Colors.fontColors,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: '#666',
  },
  calculateButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginLeft: 6,
  },
  resultCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    elevation: 5,
    shadowColor: Colors.fontColors,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.fontColors,
    marginLeft: 8,
  },
  calcontainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.1)',
  },
  label: {
    color: '#F1F5F9',
    fontWeight: '500',
    fontSize: 14,
  },
  value: {
    color: '#FCD34D',
    fontWeight: '600',
    fontSize: 14,
  },
  finalAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FCD34D',
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
  },
  finalAmountLabel: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1,
  },
  finalAmountValue: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  pdfButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  pdfButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  pdfButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  maintenanceWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  maintenanceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  maintenanceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.fontColors,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  maintenanceText: {
    fontSize: 16,
    color: '#9e9e9e',
    textAlign: 'center',
    lineHeight: 24,
  },
});