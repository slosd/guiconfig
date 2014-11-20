<?xml version="1.0"?>
<!DOCTYPE stylesheet SYSTEM "chrome://guiconfig/locale/gcLocale.dtd">
<xsl:stylesheet version="1.0"
                xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:str="http://exslt.org/strings"
                xmlns:p="http://guiconfig.freedig.org/preferences"
                extension-element-prefixes="str">

  <xsl:output method="xml"
              indent="no"
              media-type="application/vnd.mozilla.xul+xml" />

  <xsl:param name="query" />

  <xsl:include href="chars.xsl" />

  <xsl:template match="p:pref">
    <xsl:if test="@description">
      <xsl:attribute name="onmouseover">guiconfig.preferences.setDescription('<xsl:value-of select="@description" />')</xsl:attribute>
      <xsl:attribute name="onmouseout">guiconfig.preferences.setDescription('')</xsl:attribute>
    </xsl:if>
    <xsl:attribute name="data-minVersion"><xsl:value-of select="ancestor-or-self::*[@minVersion]/@minVersion" /></xsl:attribute>
    <xsl:attribute name="data-maxVersion"><xsl:value-of select="ancestor-or-self::*[@maxVersion]/@maxVersion" /></xsl:attribute>
    <xsl:attribute name="data-platform"><xsl:value-of select="ancestor-or-self::*[@platform]/@platform" /></xsl:attribute>
    <label style="font-size: smaller">
      <xsl:attribute name="value">
        <xsl:for-each select="ancestor::*[@label]">
          <xsl:value-of select="@label" />
          <xsl:if test="position() != last()"> » </xsl:if>
        </xsl:for-each>
      </xsl:attribute>
    </label>
    <hbox>
      <label class="text-link header">
        <xsl:attribute name="value">
          <xsl:choose>
            <xsl:when test="@label"><xsl:value-of select="@label" /></xsl:when>
            <xsl:when test="p:view"><xsl:value-of select="p:view/*[1]/@label" /></xsl:when>
            <xsl:otherwise><xsl:value-of select="ancestor::*[@label][1]/@label" /></xsl:otherwise>
          </xsl:choose>
        </xsl:attribute>
        <xsl:attribute name="onclick">guiconfig.preferences.showPreference('<xsl:value-of select="@key" />')</xsl:attribute>
      </label>
    </hbox>
  </xsl:template>

  <xsl:template match="*" />

  <xsl:template match="/p:preferences">
    <xsl:variable name="query_set" select="str:split(translate($query, $chars_upper, $chars_lower), ' ')" />

    <prefpane id="guiconfig-search-results" label="Search results" image="chrome://guiconfig/skin/icons/categories/search.png" flex="1">
      <vbox flex="1" style="overflow:auto">
        <xsl:for-each select="//p:pref">
          <xsl:variable name="info">
            <xsl:for-each select="ancestor::*[@label] | p:view//*[@label or @description] | p:option[@label]">
              <xsl:value-of select="concat(@label, ' ', @description, ' ')" />
            </xsl:for-each>
          </xsl:variable>
          <xsl:variable name="terms" select="translate(concat(@label, ' ', @description, ' ', $info), $chars_upper, $chars_lower)" />
          <xsl:variable name="term_set" select="str:split($terms, ' ')" />
          <xsl:variable name="match_set" select="$query_set[contains($terms, .)]" />

          <xsl:if test="count($match_set) >= count($query_set)">
            <vbox>
              <xsl:apply-templates select="." />
            </vbox>
          </xsl:if>
        </xsl:for-each>
      </vbox>
    </prefpane>
  </xsl:template>

</xsl:stylesheet>
