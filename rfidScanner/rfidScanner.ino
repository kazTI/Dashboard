#include <SPI.h>
#include <MFRC522.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Crypto.h>

//define de pins die kunnen worden geconfigureerd
#define reset D3
#define ss D4

//key length van de salt
#define KEY_LENGTH 16

//de pas lezer
MFRC522 mfrc522(ss, reset);


//wifi en mqtt gegevens
const char* ssid = "Tesla IoT";
const char* password = "fsL6HgjN";
const char* mqttServer = "145.24.238.66";
const char* pubChannel = "reader_0984_sub";
const char* subChannel = "reader_0984_pub";
const int mqttPort = 1883;
WiFiClient wifi;
PubSubClient client(wifi);

//begint alle communicaties
void setup() {
  Serial.begin(9600);
  SPI.begin();
  mfrc522.PCD_Init();
  setup_wifi();
  Serial.println("init");
  client.setServer(mqttServer, mqttPort);
  reconnect();
  client.publish("welcome", "reader is online!");
}

void loop() {
  client.loop();
   //kijkt of er een kaart is en selecteerd een kaart
  if (!mfrc522.PICC_IsNewCardPresent())
  {
    return;
  }
  if (!mfrc522.PICC_ReadCardSerial())
  {
    return;
  }
  //krijgt de kaartID
  String cardID = "";
  for (byte i = 0; i < mfrc522.uid.size; i++)
  {
    cardID.concat(String(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : ""));
    cardID.concat(String(mfrc522.uid.uidByte[i], HEX));
  }
  if (!client.connected())
  {
  reconnect();
  }
  //convert cardID to char array
  char cardChar[cardID.length()];
  cardID.toCharArray(cardChar, cardID.length() + 1);

  //maakt een salt aan met een paar waarde die gelijk blijven voor de kaart
  String salt = mfrc522.PICC_GetTypeName(mfrc522.PICC_GetType(mfrc522.uid.sak));
  salt += mfrc522.uid.sak;
  byte saltByte[salt.length()];
  salt.getBytes(saltByte, salt.length());
  SHA256HMAC hmac(saltByte, KEY_LENGTH);

  //hashed the cardID en de salt met SHA256
  hmac.doUpdate(cardChar);

  //Stopt de gehashed value (als HEX) in een string
  byte authCode[SHA256HMAC_SIZE];
  hmac.doFinal(authCode);
  String auth;
  for (byte i = 0; i < SHA256HMAC_SIZE; i++)
  {
    if (authCode[i] < 0x10) {
      auth += '0';
    }
    auth += String(authCode[i],HEX);
  }

  //convert de hashed value naar een char array en published het
  char authArray[auth.length()];
  auth.toCharArray(authArray, auth.length() + 1);
  client.publish(pubChannel, authArray);
  Serial.println(authArray);
   delay(1500);
}
/*
   deze functie zorgt voor de connectie met WiFi
*/
void setup_wifi()
{
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  randomSeed(micros());
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

/*
   reconnect met de MQTT server
*/
void reconnect()
{
  while (!client.connected())
  {
    String clientId = "fallSensor-";
    clientId += String(random(0xffff), HEX); //random clientID
    if (!client.connect(clientId.c_str()))
    {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

