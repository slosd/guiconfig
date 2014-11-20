<?xml version="1.0"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:variable name="chars_upper">&#x0041;&#x0042;&#x0043;&#x0044;&#x0045;&#x0046;&#x0047;&#x0048;&#x0049;&#x004A;&#x004B;&#x004C;&#x004D;&#x004E;&#x004F;&#x0050;&#x0051;&#x0052;&#x0053;&#x0054;&#x0055;&#x0056;&#x0057;&#x0058;&#x0059;&#x005A;&#x00C0;&#x00C1;&#x00C2;&#x00C3;&#x00C4;&#x00C5;&#x00C6;&#x00C7;&#x00C8;&#x00C9;&#x00CA;&#x00CB;&#x00CC;&#x00CD;&#x00CE;&#x00CF;&#x00D0;&#x00D1;&#x00D2;&#x00D3;&#x00D4;&#x00D5;&#x00D6;&#x00D8;&#x00D9;&#x00DA;&#x00DB;&#x00DC;&#x00DD;&#x00DE;&#x0100;&#x0102;&#x0104;&#x0106;&#x0108;&#x010A;&#x010C;&#x010E;&#x0110;&#x0112;&#x0114;&#x0116;&#x0118;&#x011A;&#x011C;&#x011E;&#x0120;&#x0122;&#x0124;&#x0126;&#x0128;&#x012A;&#x012C;&#x012E;&#x0130;&#x0132;&#x0134;&#x0136;&#x0139;&#x013B;&#x013D;&#x013F;&#x0141;&#x0143;&#x0145;&#x0147;&#x014A;&#x014C;&#x014E;&#x0150;&#x0152;&#x0154;&#x0156;&#x0158;&#x015A;&#x015C;&#x015E;&#x0160;&#x0162;&#x0164;&#x0166;&#x0168;&#x016A;&#x016C;&#x016E;&#x0170;&#x0172;&#x0174;&#x0176;&#x0178;&#x0179;&#x017B;&#x017D;&#x0181;&#x0182;&#x0184;&#x0186;&#x0187;&#x0189;&#x018A;&#x018B;&#x018E;&#x018F;&#x0190;&#x0191;&#x0193;&#x0194;&#x0196;&#x0197;&#x0198;&#x019C;&#x019D;&#x019F;&#x01A0;&#x01A2;&#x01A4;&#x01A6;&#x01A7;&#x01A9;&#x01AC;&#x01AE;&#x01AF;&#x01B1;&#x01B2;&#x01B3;&#x01B5;&#x01B7;&#x01B8;&#x01BC;&#x01C4;&#x01C5;&#x01C7;&#x01C8;&#x01CA;&#x01CB;&#x01CD;&#x01CF;&#x01D1;&#x01D3;&#x01D5;&#x01D7;&#x01D9;&#x01DB;&#x01DE;&#x01E0;&#x01E2;&#x01E4;&#x01E6;&#x01E8;&#x01EA;&#x01EC;&#x01EE;&#x01F1;&#x01F2;&#x01F4;&#x01F6;&#x01F7;&#x01F8;&#x01FA;&#x01FC;&#x01FE;&#x0200;&#x0202;&#x0204;&#x0206;&#x0208;&#x020A;&#x020C;&#x020E;&#x0210;&#x0212;&#x0214;&#x0216;&#x0218;&#x021A;&#x021C;&#x021E;&#x0220;&#x0222;&#x0224;&#x0226;&#x0228;&#x022A;&#x022C;&#x022E;&#x0230;&#x0232;&#x023A;&#x023B;&#x023D;&#x023E;&#x0241;&#x0243;&#x0244;&#x0245;&#x0246;&#x0248;&#x024A;&#x024C;&#x024E;&#x0370;&#x0372;&#x0376;&#x037F;&#x0386;&#x0388;&#x0389;&#x038A;&#x038C;&#x038E;&#x038F;&#x0391;&#x0392;&#x0393;&#x0394;&#x0395;&#x0396;&#x0397;&#x0398;&#x0399;&#x039A;&#x039B;&#x039C;&#x039D;&#x039E;&#x039F;&#x03A0;&#x03A1;&#x03A3;&#x03A4;&#x03A5;&#x03A6;&#x03A7;&#x03A8;&#x03A9;&#x03AA;&#x03AB;&#x03CF;&#x03D8;&#x03DA;&#x03DC;&#x03DE;&#x03E0;&#x03E2;&#x03E4;&#x03E6;&#x03E8;&#x03EA;&#x03EC;&#x03EE;&#x03F4;&#x03F7;&#x03F9;&#x03FA;&#x03FD;&#x03FE;&#x03FF;&#x0400;&#x0401;&#x0402;&#x0403;&#x0404;&#x0405;&#x0406;&#x0407;&#x0408;&#x0409;&#x040A;&#x040B;&#x040C;&#x040D;&#x040E;&#x040F;&#x0410;&#x0411;&#x0412;&#x0413;&#x0414;&#x0415;&#x0416;&#x0417;&#x0418;&#x0419;&#x041A;&#x041B;&#x041C;&#x041D;&#x041E;&#x041F;&#x0420;&#x0421;&#x0422;&#x0423;&#x0424;&#x0425;&#x0426;&#x0427;&#x0428;&#x0429;&#x042A;&#x042B;&#x042C;&#x042D;&#x042E;&#x042F;&#x0460;&#x0462;&#x0464;&#x0466;&#x0468;&#x046A;&#x046C;&#x046E;&#x0470;&#x0472;&#x0474;&#x0476;&#x0478;&#x047A;&#x047C;&#x047E;&#x0480;&#x048A;&#x048C;&#x048E;&#x0490;&#x0492;&#x0494;&#x0496;&#x0498;&#x049A;&#x049C;&#x049E;&#x04A0;&#x04A2;&#x04A4;&#x04A6;&#x04A8;&#x04AA;&#x04AC;&#x04AE;&#x04B0;&#x04B2;&#x04B4;&#x04B6;&#x04B8;&#x04BA;&#x04BC;&#x04BE;&#x04C0;&#x04C1;&#x04C3;&#x04C5;&#x04C7;&#x04C9;&#x04CB;&#x04CD;&#x04D0;&#x04D2;&#x04D4;&#x04D6;&#x04D8;&#x04DA;&#x04DC;&#x04DE;&#x04E0;&#x04E2;&#x04E4;&#x04E6;&#x04E8;&#x04EA;&#x04EC;&#x04EE;&#x04F0;&#x04F2;&#x04F4;&#x04F6;&#x04F8;&#x04FA;&#x04FC;&#x04FE;&#x0500;&#x0502;&#x0504;&#x0506;&#x0508;&#x050A;&#x050C;&#x050E;&#x0510;&#x0512;&#x0514;&#x0516;&#x0518;&#x051A;&#x051C;&#x051E;&#x0520;&#x0522;&#x0524;&#x0526;&#x0528;&#x052A;&#x052C;&#x052E;&#x0531;&#x0532;&#x0533;&#x0534;&#x0535;&#x0536;&#x0537;&#x0538;&#x0539;&#x053A;&#x053B;&#x053C;&#x053D;&#x053E;&#x053F;&#x0540;&#x0541;&#x0542;&#x0543;&#x0544;&#x0545;&#x0546;&#x0547;&#x0548;&#x0549;&#x054A;&#x054B;&#x054C;&#x054D;&#x054E;&#x054F;&#x0550;&#x0551;&#x0552;&#x0553;&#x0554;&#x0555;&#x0556;&#x10A0;&#x10A1;&#x10A2;&#x10A3;&#x10A4;&#x10A5;&#x10A6;&#x10A7;&#x10A8;&#x10A9;&#x10AA;&#x10AB;&#x10AC;&#x10AD;&#x10AE;&#x10AF;&#x10B0;&#x10B1;&#x10B2;&#x10B3;&#x10B4;&#x10B5;&#x10B6;&#x10B7;&#x10B8;&#x10B9;&#x10BA;&#x10BB;&#x10BC;&#x10BD;&#x10BE;&#x10BF;&#x10C0;&#x10C1;&#x10C2;&#x10C3;&#x10C4;&#x10C5;&#x10C7;&#x10CD;&#x1E00;&#x1E02;&#x1E04;&#x1E06;&#x1E08;&#x1E0A;&#x1E0C;&#x1E0E;&#x1E10;&#x1E12;&#x1E14;&#x1E16;&#x1E18;&#x1E1A;&#x1E1C;&#x1E1E;&#x1E20;&#x1E22;&#x1E24;&#x1E26;&#x1E28;&#x1E2A;&#x1E2C;&#x1E2E;&#x1E30;&#x1E32;&#x1E34;&#x1E36;&#x1E38;&#x1E3A;&#x1E3C;&#x1E3E;&#x1E40;&#x1E42;&#x1E44;&#x1E46;&#x1E48;&#x1E4A;&#x1E4C;&#x1E4E;&#x1E50;&#x1E52;&#x1E54;&#x1E56;&#x1E58;&#x1E5A;&#x1E5C;&#x1E5E;&#x1E60;&#x1E62;&#x1E64;&#x1E66;&#x1E68;&#x1E6A;&#x1E6C;&#x1E6E;&#x1E70;&#x1E72;&#x1E74;&#x1E76;&#x1E78;&#x1E7A;&#x1E7C;&#x1E7E;&#x1E80;&#x1E82;&#x1E84;&#x1E86;&#x1E88;&#x1E8A;&#x1E8C;&#x1E8E;&#x1E90;&#x1E92;&#x1E94;&#x1E9E;&#x1EA0;&#x1EA2;&#x1EA4;&#x1EA6;&#x1EA8;&#x1EAA;&#x1EAC;&#x1EAE;&#x1EB0;&#x1EB2;&#x1EB4;&#x1EB6;&#x1EB8;&#x1EBA;&#x1EBC;&#x1EBE;&#x1EC0;&#x1EC2;&#x1EC4;&#x1EC6;&#x1EC8;&#x1ECA;&#x1ECC;&#x1ECE;&#x1ED0;&#x1ED2;&#x1ED4;&#x1ED6;&#x1ED8;&#x1EDA;&#x1EDC;&#x1EDE;&#x1EE0;&#x1EE2;&#x1EE4;&#x1EE6;&#x1EE8;&#x1EEA;&#x1EEC;&#x1EEE;&#x1EF0;&#x1EF2;&#x1EF4;&#x1EF6;&#x1EF8;&#x1EFA;&#x1EFC;&#x1EFE;&#x1F08;&#x1F09;&#x1F0A;&#x1F0B;&#x1F0C;&#x1F0D;&#x1F0E;&#x1F0F;&#x1F18;&#x1F19;&#x1F1A;&#x1F1B;&#x1F1C;&#x1F1D;&#x1F28;&#x1F29;&#x1F2A;&#x1F2B;&#x1F2C;&#x1F2D;&#x1F2E;&#x1F2F;&#x1F38;&#x1F39;&#x1F3A;&#x1F3B;&#x1F3C;&#x1F3D;&#x1F3E;&#x1F3F;&#x1F48;&#x1F49;&#x1F4A;&#x1F4B;&#x1F4C;&#x1F4D;&#x1F59;&#x1F5B;&#x1F5D;&#x1F5F;&#x1F68;&#x1F69;&#x1F6A;&#x1F6B;&#x1F6C;&#x1F6D;&#x1F6E;&#x1F6F;&#x1F88;&#x1F89;&#x1F8A;&#x1F8B;&#x1F8C;&#x1F8D;&#x1F8E;&#x1F8F;&#x1F98;&#x1F99;&#x1F9A;&#x1F9B;&#x1F9C;&#x1F9D;&#x1F9E;&#x1F9F;&#x1FA8;&#x1FA9;&#x1FAA;&#x1FAB;&#x1FAC;&#x1FAD;&#x1FAE;&#x1FAF;&#x1FB8;&#x1FB9;&#x1FBA;&#x1FBB;&#x1FBC;&#x1FC8;&#x1FC9;&#x1FCA;&#x1FCB;&#x1FCC;&#x1FD8;&#x1FD9;&#x1FDA;&#x1FDB;&#x1FE8;&#x1FE9;&#x1FEA;&#x1FEB;&#x1FEC;&#x1FF8;&#x1FF9;&#x1FFA;&#x1FFB;&#x1FFC;&#x2126;&#x212A;&#x212B;&#x2132;&#x2160;&#x2161;&#x2162;&#x2163;&#x2164;&#x2165;&#x2166;&#x2167;&#x2168;&#x2169;&#x216A;&#x216B;&#x216C;&#x216D;&#x216E;&#x216F;&#x2183;&#x24B6;&#x24B7;&#x24B8;&#x24B9;&#x24BA;&#x24BB;&#x24BC;&#x24BD;&#x24BE;&#x24BF;&#x24C0;&#x24C1;&#x24C2;&#x24C3;&#x24C4;&#x24C5;&#x24C6;&#x24C7;&#x24C8;&#x24C9;&#x24CA;&#x24CB;&#x24CC;&#x24CD;&#x24CE;&#x24CF;&#x2C00;&#x2C01;&#x2C02;&#x2C03;&#x2C04;&#x2C05;&#x2C06;&#x2C07;&#x2C08;&#x2C09;&#x2C0A;&#x2C0B;&#x2C0C;&#x2C0D;&#x2C0E;&#x2C0F;&#x2C10;&#x2C11;&#x2C12;&#x2C13;&#x2C14;&#x2C15;&#x2C16;&#x2C17;&#x2C18;&#x2C19;&#x2C1A;&#x2C1B;&#x2C1C;&#x2C1D;&#x2C1E;&#x2C1F;&#x2C20;&#x2C21;&#x2C22;&#x2C23;&#x2C24;&#x2C25;&#x2C26;&#x2C27;&#x2C28;&#x2C29;&#x2C2A;&#x2C2B;&#x2C2C;&#x2C2D;&#x2C2E;&#x2C60;&#x2C62;&#x2C63;&#x2C64;&#x2C67;&#x2C69;&#x2C6B;&#x2C6D;&#x2C6E;&#x2C6F;&#x2C70;&#x2C72;&#x2C75;&#x2C7E;&#x2C7F;&#x2C80;&#x2C82;&#x2C84;&#x2C86;&#x2C88;&#x2C8A;&#x2C8C;&#x2C8E;&#x2C90;&#x2C92;&#x2C94;&#x2C96;&#x2C98;&#x2C9A;&#x2C9C;&#x2C9E;&#x2CA0;&#x2CA2;&#x2CA4;&#x2CA6;&#x2CA8;&#x2CAA;&#x2CAC;&#x2CAE;&#x2CB0;&#x2CB2;&#x2CB4;&#x2CB6;&#x2CB8;&#x2CBA;&#x2CBC;&#x2CBE;&#x2CC0;&#x2CC2;&#x2CC4;&#x2CC6;&#x2CC8;&#x2CCA;&#x2CCC;&#x2CCE;&#x2CD0;&#x2CD2;&#x2CD4;&#x2CD6;&#x2CD8;&#x2CDA;&#x2CDC;&#x2CDE;&#x2CE0;&#x2CE2;&#x2CEB;&#x2CED;&#x2CF2;&#xA640;&#xA642;&#xA644;&#xA646;&#xA648;&#xA64A;&#xA64C;&#xA64E;&#xA650;&#xA652;&#xA654;&#xA656;&#xA658;&#xA65A;&#xA65C;&#xA65E;&#xA660;&#xA662;&#xA664;&#xA666;&#xA668;&#xA66A;&#xA66C;&#xA680;&#xA682;&#xA684;&#xA686;&#xA688;&#xA68A;&#xA68C;&#xA68E;&#xA690;&#xA692;&#xA694;&#xA696;&#xA698;&#xA69A;&#xA722;&#xA724;&#xA726;&#xA728;&#xA72A;&#xA72C;&#xA72E;&#xA732;&#xA734;&#xA736;&#xA738;&#xA73A;&#xA73C;&#xA73E;&#xA740;&#xA742;&#xA744;&#xA746;&#xA748;&#xA74A;&#xA74C;&#xA74E;&#xA750;&#xA752;&#xA754;&#xA756;&#xA758;&#xA75A;&#xA75C;&#xA75E;&#xA760;&#xA762;&#xA764;&#xA766;&#xA768;&#xA76A;&#xA76C;&#xA76E;&#xA779;&#xA77B;&#xA77D;&#xA77E;&#xA780;&#xA782;&#xA784;&#xA786;&#xA78B;&#xA78D;&#xA790;&#xA792;&#xA796;&#xA798;&#xA79A;&#xA79C;&#xA79E;&#xA7A0;&#xA7A2;&#xA7A4;&#xA7A6;&#xA7A8;&#xA7AA;&#xA7AB;&#xA7AC;&#xA7AD;&#xA7B0;&#xA7B1;&#xFF21;&#xFF22;&#xFF23;&#xFF24;&#xFF25;&#xFF26;&#xFF27;&#xFF28;&#xFF29;&#xFF2A;&#xFF2B;&#xFF2C;&#xFF2D;&#xFF2E;&#xFF2F;&#xFF30;&#xFF31;&#xFF32;&#xFF33;&#xFF34;&#xFF35;&#xFF36;&#xFF37;&#xFF38;&#xFF39;&#xFF3A;&#x10400;&#x10401;&#x10402;&#x10403;&#x10404;&#x10405;&#x10406;&#x10407;&#x10408;&#x10409;&#x1040A;&#x1040B;&#x1040C;&#x1040D;&#x1040E;&#x1040F;&#x10410;&#x10411;&#x10412;&#x10413;&#x10414;&#x10415;&#x10416;&#x10417;&#x10418;&#x10419;&#x1041A;&#x1041B;&#x1041C;&#x1041D;&#x1041E;&#x1041F;&#x10420;&#x10421;&#x10422;&#x10423;&#x10424;&#x10425;&#x10426;&#x10427;&#x118A0;&#x118A1;&#x118A2;&#x118A3;&#x118A4;&#x118A5;&#x118A6;&#x118A7;&#x118A8;&#x118A9;&#x118AA;&#x118AB;&#x118AC;&#x118AD;&#x118AE;&#x118AF;&#x118B0;&#x118B1;&#x118B2;&#x118B3;&#x118B4;&#x118B5;&#x118B6;&#x118B7;&#x118B8;&#x118B9;&#x118BA;&#x118BB;&#x118BC;&#x118BD;&#x118BE;&#x118BF;</xsl:variable>
  <xsl:variable name="chars_lower">&#x0061;&#x0062;&#x0063;&#x0064;&#x0065;&#x0066;&#x0067;&#x0068;&#x0069;&#x006A;&#x006B;&#x006C;&#x006D;&#x006E;&#x006F;&#x0070;&#x0071;&#x0072;&#x0073;&#x0074;&#x0075;&#x0076;&#x0077;&#x0078;&#x0079;&#x007A;&#x00E0;&#x00E1;&#x00E2;&#x00E3;&#x00E4;&#x00E5;&#x00E6;&#x00E7;&#x00E8;&#x00E9;&#x00EA;&#x00EB;&#x00EC;&#x00ED;&#x00EE;&#x00EF;&#x00F0;&#x00F1;&#x00F2;&#x00F3;&#x00F4;&#x00F5;&#x00F6;&#x00F8;&#x00F9;&#x00FA;&#x00FB;&#x00FC;&#x00FD;&#x00FE;&#x0101;&#x0103;&#x0105;&#x0107;&#x0109;&#x010B;&#x010D;&#x010F;&#x0111;&#x0113;&#x0115;&#x0117;&#x0119;&#x011B;&#x011D;&#x011F;&#x0121;&#x0123;&#x0125;&#x0127;&#x0129;&#x012B;&#x012D;&#x012F;&#x0069;&#x0133;&#x0135;&#x0137;&#x013A;&#x013C;&#x013E;&#x0140;&#x0142;&#x0144;&#x0146;&#x0148;&#x014B;&#x014D;&#x014F;&#x0151;&#x0153;&#x0155;&#x0157;&#x0159;&#x015B;&#x015D;&#x015F;&#x0161;&#x0163;&#x0165;&#x0167;&#x0169;&#x016B;&#x016D;&#x016F;&#x0171;&#x0173;&#x0175;&#x0177;&#x00FF;&#x017A;&#x017C;&#x017E;&#x0253;&#x0183;&#x0185;&#x0254;&#x0188;&#x0256;&#x0257;&#x018C;&#x01DD;&#x0259;&#x025B;&#x0192;&#x0260;&#x0263;&#x0269;&#x0268;&#x0199;&#x026F;&#x0272;&#x0275;&#x01A1;&#x01A3;&#x01A5;&#x0280;&#x01A8;&#x0283;&#x01AD;&#x0288;&#x01B0;&#x028A;&#x028B;&#x01B4;&#x01B6;&#x0292;&#x01B9;&#x01BD;&#x01C6;&#x01C6;&#x01C9;&#x01C9;&#x01CC;&#x01CC;&#x01CE;&#x01D0;&#x01D2;&#x01D4;&#x01D6;&#x01D8;&#x01DA;&#x01DC;&#x01DF;&#x01E1;&#x01E3;&#x01E5;&#x01E7;&#x01E9;&#x01EB;&#x01ED;&#x01EF;&#x01F3;&#x01F3;&#x01F5;&#x0195;&#x01BF;&#x01F9;&#x01FB;&#x01FD;&#x01FF;&#x0201;&#x0203;&#x0205;&#x0207;&#x0209;&#x020B;&#x020D;&#x020F;&#x0211;&#x0213;&#x0215;&#x0217;&#x0219;&#x021B;&#x021D;&#x021F;&#x019E;&#x0223;&#x0225;&#x0227;&#x0229;&#x022B;&#x022D;&#x022F;&#x0231;&#x0233;&#x2C65;&#x023C;&#x019A;&#x2C66;&#x0242;&#x0180;&#x0289;&#x028C;&#x0247;&#x0249;&#x024B;&#x024D;&#x024F;&#x0371;&#x0373;&#x0377;&#x03F3;&#x03AC;&#x03AD;&#x03AE;&#x03AF;&#x03CC;&#x03CD;&#x03CE;&#x03B1;&#x03B2;&#x03B3;&#x03B4;&#x03B5;&#x03B6;&#x03B7;&#x03B8;&#x03B9;&#x03BA;&#x03BB;&#x03BC;&#x03BD;&#x03BE;&#x03BF;&#x03C0;&#x03C1;&#x03C3;&#x03C4;&#x03C5;&#x03C6;&#x03C7;&#x03C8;&#x03C9;&#x03CA;&#x03CB;&#x03D7;&#x03D9;&#x03DB;&#x03DD;&#x03DF;&#x03E1;&#x03E3;&#x03E5;&#x03E7;&#x03E9;&#x03EB;&#x03ED;&#x03EF;&#x03B8;&#x03F8;&#x03F2;&#x03FB;&#x037B;&#x037C;&#x037D;&#x0450;&#x0451;&#x0452;&#x0453;&#x0454;&#x0455;&#x0456;&#x0457;&#x0458;&#x0459;&#x045A;&#x045B;&#x045C;&#x045D;&#x045E;&#x045F;&#x0430;&#x0431;&#x0432;&#x0433;&#x0434;&#x0435;&#x0436;&#x0437;&#x0438;&#x0439;&#x043A;&#x043B;&#x043C;&#x043D;&#x043E;&#x043F;&#x0440;&#x0441;&#x0442;&#x0443;&#x0444;&#x0445;&#x0446;&#x0447;&#x0448;&#x0449;&#x044A;&#x044B;&#x044C;&#x044D;&#x044E;&#x044F;&#x0461;&#x0463;&#x0465;&#x0467;&#x0469;&#x046B;&#x046D;&#x046F;&#x0471;&#x0473;&#x0475;&#x0477;&#x0479;&#x047B;&#x047D;&#x047F;&#x0481;&#x048B;&#x048D;&#x048F;&#x0491;&#x0493;&#x0495;&#x0497;&#x0499;&#x049B;&#x049D;&#x049F;&#x04A1;&#x04A3;&#x04A5;&#x04A7;&#x04A9;&#x04AB;&#x04AD;&#x04AF;&#x04B1;&#x04B3;&#x04B5;&#x04B7;&#x04B9;&#x04BB;&#x04BD;&#x04BF;&#x04CF;&#x04C2;&#x04C4;&#x04C6;&#x04C8;&#x04CA;&#x04CC;&#x04CE;&#x04D1;&#x04D3;&#x04D5;&#x04D7;&#x04D9;&#x04DB;&#x04DD;&#x04DF;&#x04E1;&#x04E3;&#x04E5;&#x04E7;&#x04E9;&#x04EB;&#x04ED;&#x04EF;&#x04F1;&#x04F3;&#x04F5;&#x04F7;&#x04F9;&#x04FB;&#x04FD;&#x04FF;&#x0501;&#x0503;&#x0505;&#x0507;&#x0509;&#x050B;&#x050D;&#x050F;&#x0511;&#x0513;&#x0515;&#x0517;&#x0519;&#x051B;&#x051D;&#x051F;&#x0521;&#x0523;&#x0525;&#x0527;&#x0529;&#x052B;&#x052D;&#x052F;&#x0561;&#x0562;&#x0563;&#x0564;&#x0565;&#x0566;&#x0567;&#x0568;&#x0569;&#x056A;&#x056B;&#x056C;&#x056D;&#x056E;&#x056F;&#x0570;&#x0571;&#x0572;&#x0573;&#x0574;&#x0575;&#x0576;&#x0577;&#x0578;&#x0579;&#x057A;&#x057B;&#x057C;&#x057D;&#x057E;&#x057F;&#x0580;&#x0581;&#x0582;&#x0583;&#x0584;&#x0585;&#x0586;&#x2D00;&#x2D01;&#x2D02;&#x2D03;&#x2D04;&#x2D05;&#x2D06;&#x2D07;&#x2D08;&#x2D09;&#x2D0A;&#x2D0B;&#x2D0C;&#x2D0D;&#x2D0E;&#x2D0F;&#x2D10;&#x2D11;&#x2D12;&#x2D13;&#x2D14;&#x2D15;&#x2D16;&#x2D17;&#x2D18;&#x2D19;&#x2D1A;&#x2D1B;&#x2D1C;&#x2D1D;&#x2D1E;&#x2D1F;&#x2D20;&#x2D21;&#x2D22;&#x2D23;&#x2D24;&#x2D25;&#x2D27;&#x2D2D;&#x1E01;&#x1E03;&#x1E05;&#x1E07;&#x1E09;&#x1E0B;&#x1E0D;&#x1E0F;&#x1E11;&#x1E13;&#x1E15;&#x1E17;&#x1E19;&#x1E1B;&#x1E1D;&#x1E1F;&#x1E21;&#x1E23;&#x1E25;&#x1E27;&#x1E29;&#x1E2B;&#x1E2D;&#x1E2F;&#x1E31;&#x1E33;&#x1E35;&#x1E37;&#x1E39;&#x1E3B;&#x1E3D;&#x1E3F;&#x1E41;&#x1E43;&#x1E45;&#x1E47;&#x1E49;&#x1E4B;&#x1E4D;&#x1E4F;&#x1E51;&#x1E53;&#x1E55;&#x1E57;&#x1E59;&#x1E5B;&#x1E5D;&#x1E5F;&#x1E61;&#x1E63;&#x1E65;&#x1E67;&#x1E69;&#x1E6B;&#x1E6D;&#x1E6F;&#x1E71;&#x1E73;&#x1E75;&#x1E77;&#x1E79;&#x1E7B;&#x1E7D;&#x1E7F;&#x1E81;&#x1E83;&#x1E85;&#x1E87;&#x1E89;&#x1E8B;&#x1E8D;&#x1E8F;&#x1E91;&#x1E93;&#x1E95;&#x00DF;&#x1EA1;&#x1EA3;&#x1EA5;&#x1EA7;&#x1EA9;&#x1EAB;&#x1EAD;&#x1EAF;&#x1EB1;&#x1EB3;&#x1EB5;&#x1EB7;&#x1EB9;&#x1EBB;&#x1EBD;&#x1EBF;&#x1EC1;&#x1EC3;&#x1EC5;&#x1EC7;&#x1EC9;&#x1ECB;&#x1ECD;&#x1ECF;&#x1ED1;&#x1ED3;&#x1ED5;&#x1ED7;&#x1ED9;&#x1EDB;&#x1EDD;&#x1EDF;&#x1EE1;&#x1EE3;&#x1EE5;&#x1EE7;&#x1EE9;&#x1EEB;&#x1EED;&#x1EEF;&#x1EF1;&#x1EF3;&#x1EF5;&#x1EF7;&#x1EF9;&#x1EFB;&#x1EFD;&#x1EFF;&#x1F00;&#x1F01;&#x1F02;&#x1F03;&#x1F04;&#x1F05;&#x1F06;&#x1F07;&#x1F10;&#x1F11;&#x1F12;&#x1F13;&#x1F14;&#x1F15;&#x1F20;&#x1F21;&#x1F22;&#x1F23;&#x1F24;&#x1F25;&#x1F26;&#x1F27;&#x1F30;&#x1F31;&#x1F32;&#x1F33;&#x1F34;&#x1F35;&#x1F36;&#x1F37;&#x1F40;&#x1F41;&#x1F42;&#x1F43;&#x1F44;&#x1F45;&#x1F51;&#x1F53;&#x1F55;&#x1F57;&#x1F60;&#x1F61;&#x1F62;&#x1F63;&#x1F64;&#x1F65;&#x1F66;&#x1F67;&#x1F80;&#x1F81;&#x1F82;&#x1F83;&#x1F84;&#x1F85;&#x1F86;&#x1F87;&#x1F90;&#x1F91;&#x1F92;&#x1F93;&#x1F94;&#x1F95;&#x1F96;&#x1F97;&#x1FA0;&#x1FA1;&#x1FA2;&#x1FA3;&#x1FA4;&#x1FA5;&#x1FA6;&#x1FA7;&#x1FB0;&#x1FB1;&#x1F70;&#x1F71;&#x1FB3;&#x1F72;&#x1F73;&#x1F74;&#x1F75;&#x1FC3;&#x1FD0;&#x1FD1;&#x1F76;&#x1F77;&#x1FE0;&#x1FE1;&#x1F7A;&#x1F7B;&#x1FE5;&#x1F78;&#x1F79;&#x1F7C;&#x1F7D;&#x1FF3;&#x03C9;&#x006B;&#x00E5;&#x214E;&#x2170;&#x2171;&#x2172;&#x2173;&#x2174;&#x2175;&#x2176;&#x2177;&#x2178;&#x2179;&#x217A;&#x217B;&#x217C;&#x217D;&#x217E;&#x217F;&#x2184;&#x24D0;&#x24D1;&#x24D2;&#x24D3;&#x24D4;&#x24D5;&#x24D6;&#x24D7;&#x24D8;&#x24D9;&#x24DA;&#x24DB;&#x24DC;&#x24DD;&#x24DE;&#x24DF;&#x24E0;&#x24E1;&#x24E2;&#x24E3;&#x24E4;&#x24E5;&#x24E6;&#x24E7;&#x24E8;&#x24E9;&#x2C30;&#x2C31;&#x2C32;&#x2C33;&#x2C34;&#x2C35;&#x2C36;&#x2C37;&#x2C38;&#x2C39;&#x2C3A;&#x2C3B;&#x2C3C;&#x2C3D;&#x2C3E;&#x2C3F;&#x2C40;&#x2C41;&#x2C42;&#x2C43;&#x2C44;&#x2C45;&#x2C46;&#x2C47;&#x2C48;&#x2C49;&#x2C4A;&#x2C4B;&#x2C4C;&#x2C4D;&#x2C4E;&#x2C4F;&#x2C50;&#x2C51;&#x2C52;&#x2C53;&#x2C54;&#x2C55;&#x2C56;&#x2C57;&#x2C58;&#x2C59;&#x2C5A;&#x2C5B;&#x2C5C;&#x2C5D;&#x2C5E;&#x2C61;&#x026B;&#x1D7D;&#x027D;&#x2C68;&#x2C6A;&#x2C6C;&#x0251;&#x0271;&#x0250;&#x0252;&#x2C73;&#x2C76;&#x023F;&#x0240;&#x2C81;&#x2C83;&#x2C85;&#x2C87;&#x2C89;&#x2C8B;&#x2C8D;&#x2C8F;&#x2C91;&#x2C93;&#x2C95;&#x2C97;&#x2C99;&#x2C9B;&#x2C9D;&#x2C9F;&#x2CA1;&#x2CA3;&#x2CA5;&#x2CA7;&#x2CA9;&#x2CAB;&#x2CAD;&#x2CAF;&#x2CB1;&#x2CB3;&#x2CB5;&#x2CB7;&#x2CB9;&#x2CBB;&#x2CBD;&#x2CBF;&#x2CC1;&#x2CC3;&#x2CC5;&#x2CC7;&#x2CC9;&#x2CCB;&#x2CCD;&#x2CCF;&#x2CD1;&#x2CD3;&#x2CD5;&#x2CD7;&#x2CD9;&#x2CDB;&#x2CDD;&#x2CDF;&#x2CE1;&#x2CE3;&#x2CEC;&#x2CEE;&#x2CF3;&#xA641;&#xA643;&#xA645;&#xA647;&#xA649;&#xA64B;&#xA64D;&#xA64F;&#xA651;&#xA653;&#xA655;&#xA657;&#xA659;&#xA65B;&#xA65D;&#xA65F;&#xA661;&#xA663;&#xA665;&#xA667;&#xA669;&#xA66B;&#xA66D;&#xA681;&#xA683;&#xA685;&#xA687;&#xA689;&#xA68B;&#xA68D;&#xA68F;&#xA691;&#xA693;&#xA695;&#xA697;&#xA699;&#xA69B;&#xA723;&#xA725;&#xA727;&#xA729;&#xA72B;&#xA72D;&#xA72F;&#xA733;&#xA735;&#xA737;&#xA739;&#xA73B;&#xA73D;&#xA73F;&#xA741;&#xA743;&#xA745;&#xA747;&#xA749;&#xA74B;&#xA74D;&#xA74F;&#xA751;&#xA753;&#xA755;&#xA757;&#xA759;&#xA75B;&#xA75D;&#xA75F;&#xA761;&#xA763;&#xA765;&#xA767;&#xA769;&#xA76B;&#xA76D;&#xA76F;&#xA77A;&#xA77C;&#x1D79;&#xA77F;&#xA781;&#xA783;&#xA785;&#xA787;&#xA78C;&#x0265;&#xA791;&#xA793;&#xA797;&#xA799;&#xA79B;&#xA79D;&#xA79F;&#xA7A1;&#xA7A3;&#xA7A5;&#xA7A7;&#xA7A9;&#x0266;&#x025C;&#x0261;&#x026C;&#x029E;&#x0287;&#xFF41;&#xFF42;&#xFF43;&#xFF44;&#xFF45;&#xFF46;&#xFF47;&#xFF48;&#xFF49;&#xFF4A;&#xFF4B;&#xFF4C;&#xFF4D;&#xFF4E;&#xFF4F;&#xFF50;&#xFF51;&#xFF52;&#xFF53;&#xFF54;&#xFF55;&#xFF56;&#xFF57;&#xFF58;&#xFF59;&#xFF5A;&#x10428;&#x10429;&#x1042A;&#x1042B;&#x1042C;&#x1042D;&#x1042E;&#x1042F;&#x10430;&#x10431;&#x10432;&#x10433;&#x10434;&#x10435;&#x10436;&#x10437;&#x10438;&#x10439;&#x1043A;&#x1043B;&#x1043C;&#x1043D;&#x1043E;&#x1043F;&#x10440;&#x10441;&#x10442;&#x10443;&#x10444;&#x10445;&#x10446;&#x10447;&#x10448;&#x10449;&#x1044A;&#x1044B;&#x1044C;&#x1044D;&#x1044E;&#x1044F;&#x118C0;&#x118C1;&#x118C2;&#x118C3;&#x118C4;&#x118C5;&#x118C6;&#x118C7;&#x118C8;&#x118C9;&#x118CA;&#x118CB;&#x118CC;&#x118CD;&#x118CE;&#x118CF;&#x118D0;&#x118D1;&#x118D2;&#x118D3;&#x118D4;&#x118D5;&#x118D6;&#x118D7;&#x118D8;&#x118D9;&#x118DA;&#x118DB;&#x118DC;&#x118DD;&#x118DE;&#x118DF;</xsl:variable>
</xsl:stylesheet>
