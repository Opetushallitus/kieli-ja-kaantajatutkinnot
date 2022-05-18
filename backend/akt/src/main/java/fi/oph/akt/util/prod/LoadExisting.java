package fi.oph.akt.util.prod;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;

public class LoadExisting {

  public static void main(String[] args) throws Exception {
    for (int i = 0; i < 2650; i += 50) {
      //    for (int i = 0; i < 1; i++) {
      final String u = "http://www03.oph.fi/kaantajat/hakutulos.asp?MISTA=&MIHIN=&SNIMI=&offset=" + i;
      final String s = getText(u);
      final String colspan = s.split("colspan")[3];
      final int first = colspan.indexOf("<td><b>");
      final String data = colspan.substring(first);
      for (String line : data.split("<td><b>")) {
        if (line.isBlank()) {
          continue;
        }
        final String[] parts = line.replace("</td>", "").replace("</tr> ", "").replace("<tr><td", "").split("<td>");
        final String[] nameParts = parts[0].split("</b>&nbsp;");
        final String lastName = nameParts[0].trim();
        final String firstName = nameParts[1].trim();

        final String[] fromToParts = parts[1].split("-");
        final String from = fromToParts[0].trim();
        final String to = fromToParts[1].trim();

        final String[] addressParts = parts[2].split("&nbsp;");
        final String postal = addressParts[0].trim();
        final String city = addressParts[1].trim();

        System.out.println(String.format("%s %s %s - %s %s %s", lastName, firstName, from, to, postal, city));
      }
    }
  }

  public static String getText(String url) throws Exception {
    final URL website = new URL(url);
    final URLConnection connection = website.openConnection();
    final BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream(), "Latin1"));

    StringBuilder response = new StringBuilder();
    String inputLine;

    while ((inputLine = in.readLine()) != null) response.append(inputLine);

    in.close();

    return response.toString();
  }
}
